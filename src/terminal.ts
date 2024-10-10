import type { InputStream, OutputStream } from './io'

export class Terminal {
  private output: string[] = []
  private currentInput: string = ''
  private prompt: string = '$ '

  constructor(
    private element: HTMLElement,
    private stdin: InputStream,
    private stdout: OutputStream,
  ) {
    this.setupEventListeners()
    this.startReading()
    this.render() // Initial render with prompt
  }

  public focus(): void {
    this.element.focus()
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  private handleKeyDown(event: KeyboardEvent): void {
    event.preventDefault()
    if (event.key === 'Enter') {
      this.handleEnter()
    }
    else if (event.key === 'Backspace') {
      this.handleBackspace()
    }
    else if (event.key.length === 1) {
      this.handleCharacter(event.key)
    }
    this.render()
  }

  private handleEnter(): void {
    this.output.push(this.wrapLine(this.prompt + this.currentInput))
    this.stdin.write(`${this.currentInput}\n`)
    this.currentInput = ''
  }

  private handleBackspace(): void {
    if (this.currentInput.length > 0) {
      this.currentInput = this.currentInput.slice(0, -1)
    }
  }

  private handleCharacter(char: string): void {
    this.currentInput += char
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

  private render(): void {
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
