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
    this.output.push(this.prompt + this.currentInput)
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
        this.output.push(data.trim())
      }
      this.render()
    })
  }

  private render(): void {
    const outputHtml = this.output.map(this.wrapLine.bind(this)).join('<br>')
    const currentLineHtml = this.wrapLine(this.prompt + this.currentInput)

    this.element.innerHTML = `${outputHtml
      + (this.output.length > 0 ? '<br>' : '')
      + currentLineHtml
      }<span class="cursor">█</span>`

    this.element.scrollTop = this.element.scrollHeight
  }

  private wrapLine(line: string): string {
    if (line.startsWith(this.prompt)) {
      return `<span class="prompt">${this.prompt}</span><span class="user-input">${line.slice(this.prompt.length)}</span>`
    }
    return `<span class="output">${line}</span>`
  }

  private clear(): void {
    this.output = []
    this.currentInput = ''
  }
}

