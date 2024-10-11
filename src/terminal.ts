import type { OutputStream } from './io'
import type { CompletionFunction } from './shell'

export class Terminal {
  private output: string[] = []
  private buffer: string = ''
  private currentPrompt: string = ''
  private isValidCommand: (input: string) => boolean

  constructor(
    private element: HTMLElement,
    private stdout: OutputStream,
    private onInputCallback: (input: string) => void,
    private completionFunction: CompletionFunction,
    private getPromptCallback: () => string,
    isValidCommandCallback: (input: string) => boolean,
  ) {
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
      if (data === '\x1B[2J\x1B[0f') {
        this.clear()
      }
      else {
        const lines = data.split('\n')
        this.output.push(...lines.filter(line => line.trim() !== ''))
      }
      this.render()
    })
  }

  private render(completions: string[] = [], selectedIndex: number = -1): void {
    const outputHtml = this.output.map(line => `<div class="command-output">${this.escapeHtml(line)}</div>`).join('')

    const [commandName] = this.buffer.split(/\s+/)
    const isValid = this.isValidCommand(commandName)
    const commandClass = isValid ? 'valid-command' : ''

    const currentLineHtml = `<div class="command-input">${this.escapeHtml(this.currentPrompt)}<span class="user-input ${commandClass}">${this.escapeHtml(this.buffer)}</span><span class="cursor">█</span></div>`
    let completionsHtml = ''
    if (completions.length > 0) {
      completionsHtml = `
        <div class="completions">${completions.map((completion, index) =>
        `<div class="${index === selectedIndex ? 'selected' : ''}">${this.escapeHtml(completion)}</div>`,
      ).join('')
        }</div>`
    }
    this.element.innerHTML = `
      <div class="terminal-output">${outputHtml}</div>
      <div class="terminal-input">${currentLineHtml}</div>
      ${completionsHtml}
    `
    this.element.scrollTop = this.element.scrollHeight
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  private clear(): void {
    this.output = []
    this.buffer = ''
  }
}
