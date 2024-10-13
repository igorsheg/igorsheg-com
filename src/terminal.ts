import type { OutputStream } from './io'
import type { CompletionFunction } from './shell'
import { ANSI } from './lib'
import { TerminalRenderer } from './render'

export class Terminal {
  private output: string[] = []
  private buffer: string = ''
  private currentPrompt: string = ''
  private isValidCommand: (input: string) => string
  private renderer: TerminalRenderer

  constructor(
    private element: HTMLElement,
    private stdout: OutputStream,
    private onInputCallback: (input: string) => void,
    private completionFunction: CompletionFunction,
    private getPromptCallback: () => string,
    isValidCommandCallback: (input: string) => string,
  ) {
    this.renderer = new TerminalRenderer(element)
    this.setupEventListeners()
    this.startReading()
    this.updatePrompt()
    this.isValidCommand = isValidCommandCallback
    this.render()
  }

  public focus(): void {
    this.element.focus()
  }

  private setupEventListeners(): void {
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  private handleKeyDown(event: KeyboardEvent): void {
    event.preventDefault()

    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault()
      this.handleCtrlL()
      return
    }
    switch (event.key) {
      case 'Enter':
        this.sendInput()
        break
      case 'Backspace':
        this.backspace()
        break
      case 'Tab':
        this.handleTabCompletion(0)
        break
      case 'ArrowUp':
        this.handleTabCompletion(-1)
        break
      case 'ArrowDown':
        this.handleTabCompletion(1)
        break
      default:
        if (event.key.length === 1) {
          this.appendToInput(event.key)
        }
    }
  }

  private handleTabCompletion(direction: number): void {
    const { newLine, completions, selectedIndex } = this.completionFunction(this.buffer, direction)
    this.buffer = newLine
    this.render(completions, selectedIndex)
  }

  private sendInput(): void {
    const input = this.buffer
    this.output.push(this.currentPrompt + input)
    this.onInputCallback(`${input}\n`)
    this.buffer = ''
    this.updatePrompt()
    this.render()
  }

  private updatePrompt(): void {
    this.currentPrompt = this.getPromptCallback()
  }

  private handleCtrlL(): void {
    this.output.push(`${this.currentPrompt + this.buffer}^C`)
    this.clear()
    this.updatePrompt()
    this.render()
  }

  private backspace(): void {
    if (this.buffer.length > 0) {
      this.buffer = this.buffer.slice(0, -1)
      this.render()
    }
  }

  private appendToInput(char: string): void {
    this.buffer += char
    this.render()
  }

  private startReading(): void {
    this.stdout.onWrite((data) => {
      if (data === ANSI.CLEAR) {
        this.clear()
      }
      else {
        const lines = data.split('\n')
        lines.forEach((line, index) => {
          if (index === lines.length - 1 && line === '') {
            return
          }
          this.output.push(line)
        })
      }
      this.render()
    })
  }

  private render(completions: string[] = [], selectedIndex: number = -1): void {
    const currentInput = this.isValidCommand(this.buffer)
    this.renderer.render(this.output, this.currentPrompt, currentInput, completions, selectedIndex)
  }

  private clear(): void {
    this.output = []
    this.buffer = ''
  }
}