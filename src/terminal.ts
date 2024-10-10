import type { InputStream, OutputStream } from './io'
import { TerminalEventHandler } from './event'

export class Terminal {
  private output: string[] = []
  private currentInput: string = ''
  private prompt: string = '$ '
  private eventHandler: TerminalEventHandler

  constructor(
    private element: HTMLElement,
    private stdin: InputStream,
    private stdout: OutputStream,
  ) {
    this.eventHandler = new TerminalEventHandler(this)
    this.setupEventListeners()
    this.startReading()
    this.render() // Initial render with prompt
  }

  public focus(): void {
    this.element.focus()
  }

  public getCurrentInput(): string {
    return this.currentInput
  }

  public getPrompt(): string {
    return this.prompt
  }

  public addToOutput(line: string): void {
    this.output.push(this.wrapLine(line))
  }

  public sendInput(input: string): void {
    this.stdin.write(`${input}\n`)
  }

  public clearCurrentInput(): void {
    this.currentInput = ''
  }

  public backspace(): void {
    if (this.currentInput.length > 0) {
      this.currentInput = this.currentInput.slice(0, -1)
    }
  }

  public appendToInput(char: string): void {
    this.currentInput += char
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.eventHandler.handleEvent.bind(this.eventHandler))
  }

  private startReading(): void {
    this.stdout.onWrite((data) => {
      if (data === '\x1B[2J\x1B[0f') {
        this.clear()
      }
      else {
        // Split the data into lines and add each non-empty line to the output
        const lines = data.split('\n')
        this.output.push(...lines
          .filter(line => line.trim() !== '')
          .map(line => this.wrapLine(line)),
        )
      }
      this.render()
    })
  }

  public render(): void {
    const outputHtml = this.output.join('')
    const currentLineHtml = this.wrapLine(this.prompt + this.currentInput, true)
    this.element.innerHTML = `<div class="terminal-output">${outputHtml}</div>
                              <div class="terminal-input">${currentLineHtml}</div>`
    this.element.scrollTop = this.element.scrollHeight
  }

  private wrapLine(line: string, isCurrent: boolean = false): string {
    if (line.startsWith(this.prompt)) {
      const promptSpan = `<span class="prompt">${this.prompt}</span>`
      const inputSpan = `<span class="user-input">${this.escapeHtml(line.slice(this.prompt.length))}</span>`
      return isCurrent
        ? `${promptSpan}${inputSpan}<span class="cursor">█</span>`
        : `${promptSpan}${inputSpan}\n`
    }
    return `<span class="output">${this.escapeHtml(line)}</span>\n`
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
    this.currentInput = ''
  }
}
