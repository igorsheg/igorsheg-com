import type { OutputStream } from './io'
import type { CompletionFunction } from './shell'
import { TerminalRenderer } from './render'

export class Terminal {
  private output: string[] = []
  private buffer: string = ''
  private ansiBuffer: string = ''
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
      case ' ':
        this.appendToInput(' ')
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
      for (let i = 0; i < data.length; i++) {
        const char = data[i]
        if (this.ansiBuffer.length > 0 || char === '\x1B') {
          this.ansiBuffer += char
          if (this.isCompleteAnsiSequence(this.ansiBuffer)) {
            this.handleAnsiSequence(this.ansiBuffer)
            this.ansiBuffer = ''
          }
        }
        else if (char === '\n') {
          this.handleCompleteLine(this.buffer)
          this.buffer = ''
        }
        else {
          this.buffer += char
        }
      }
      if (this.buffer.length > 0) {
        this.handleCompleteLine(this.buffer)
        this.buffer = ''
      }
      this.render()
    })
  }

  private isCompleteAnsiSequence(sequence: string): boolean {
    return /^\x1B\[[0-9;]*[A-Z]$/i.test(sequence)
  }

  private handleAnsiSequence(sequence: string): void {
    if (sequence === '\x1B[2J') {
      this.clear()
    }
    else if (sequence === '\x1B[0f' || sequence === '\x1B[H') {
      // Move cursor to home position (0, 0)
      // In our case, we don't need to do anything special
    }
    // Add more ANSI sequence handlers as needed
  }

  private handleCompleteLine(line: string): void {
    this.output.push(line)
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
