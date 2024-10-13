export class TerminalRenderer {
  private container: HTMLElement
  private outputElement: HTMLElement
  private inputElement: HTMLElement
  private completionsElement: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
    this.outputElement = document.createElement('div')
    this.outputElement.className = 'terminal-output'
    this.inputElement = document.createElement('div')
    this.inputElement.className = 'terminal-input'
    this.completionsElement = document.createElement('div')
    this.completionsElement.className = 'completions'

    this.container.appendChild(this.outputElement)
    this.container.appendChild(this.inputElement)
    this.container.appendChild(this.completionsElement)
  }

  render(output: string[], currentPrompt: string, currentInput: string, completions: string[], selectedIndex: number): void {
    this.renderOutput(output)
    this.renderInput(currentPrompt, currentInput)
    this.renderCompletions(completions, selectedIndex)
    this.scrollToBottom()
  }

  private renderOutput(output: string[]): void {
    this.outputElement.innerHTML = output.map(line =>
      `<div class="command-output">${this.parseAnsiEscapes(line).replace(/\n/g, '<br>')}</div>`,
    ).join('')
  }

  private renderInput(prompt: string, input: string): void {
    this.inputElement.innerHTML = `<div class="command-input">${this.parseAnsiEscapes(prompt + input)}<span class="cursor">█</span></div>`
  }

  private renderCompletions(completions: string[], selectedIndex: number): void {
    if (completions.length > 0) {
      this.completionsElement.innerHTML = completions.map((completion, index) =>
        `<div class="${index === selectedIndex ? 'selected' : ''}">${this.escapeHtml(completion)}</div>`,
      ).join('')
      this.completionsElement.style.display = 'block'
    }
    else {
      this.completionsElement.style.display = 'none'
    }
  }

  private parseAnsiEscapes(text: string): string {
    const ESC = '\u001B'
    const ansiRegex = new RegExp(`${ESC}\\[([0-9;]*)m`, 'g')
    let result = ''
    let lastIndex = 0

    const openTags: string[] = []

    let match = ansiRegex.exec(text)
    while (match !== null) {
      result += this.escapeHtml(text.slice(lastIndex, match.index))
      lastIndex = ansiRegex.lastIndex

      const codes = match[1].split(';').map(Number)
      for (const code of codes) {
        switch (code) {
          case 0: // Reset
            while (openTags.length > 0) {
              result += `</span>`
              openTags.pop()
            }
            break
          case 1: // Bold
            result += `<span class="bold">`
            openTags.push('bold')
            break
          case 4: // Underline
            result += `<span class="underline">`
            openTags.push('underline')
            break
          case 31: // Red
            result += `<span class="red">`
            openTags.push('red')
            break
          case 32: // Green
            result += `<span class="green">`
            openTags.push('green')
            break
          case 33: // Yellow
            result += `<span class="yellow">`
            openTags.push('yellow')
            break
          case 34: // Blue
            result += `<span class="blue">`
            openTags.push('blue')
            break
          case 35: // Magenta
            result += `<span class="magenta">`
            openTags.push('magenta')
            break
          case 36: // Cyan
            result += `<span class="cyan">`
            openTags.push('cyan')
            break
          // Add more cases as needed
        }
      }

      match = ansiRegex.exec(text)
    }

    result += this.escapeHtml(text.slice(lastIndex))

    // Close any remaining open tags
    while (openTags.length > 0) {
      result += `</span>`
      openTags.pop()
    }

    return result
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  private scrollToBottom(): void {
    this.container.scrollTop = this.container.scrollHeight
  }

  clear(): void {
    this.outputElement.innerHTML = ''
  }
}
