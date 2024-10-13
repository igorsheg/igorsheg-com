import { ANSI } from './lib'

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
    const ansiRegex = new RegExp(`\x1B\\[([0-9;]*)m`, 'g')
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
          case 2: // Dim
            result += `<span class="dim">`
            openTags.push('dim')
            break
          case 3: // Italic
            result += `<span class="italic">`
            openTags.push('italic')
            break
          case 4: // Underline
            result += `<span class="underline">`
            openTags.push('underline')
            break
          case 5: // Blink
            result += `<span class="blink">`
            openTags.push('blink')
            break
          case 7: // Reverse
            result += `<span class="reverse">`
            openTags.push('reverse')
            break
          case 8: // Hidden
            result += `<span class="hidden">`
            openTags.push('hidden')
            break
          case 30: case 31: case 32: case 33: case 34: case 35: case 36: case 37:
            const colorClass = Object.keys(ANSI.FG).find(key => ANSI.FG[key as keyof typeof ANSI.FG].endsWith(`[${code}m`))
            if (colorClass) {
              result += `<span class="${colorClass.toLowerCase()}">`
              openTags.push(colorClass.toLowerCase())
            }
            break
          case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47:
            const bgColorClass = Object.keys(ANSI.BG).find(key => ANSI.BG[key as keyof typeof ANSI.BG].endsWith(`[${code}m`))
            if (bgColorClass) {
              result += `<span class="bg-${bgColorClass.toLowerCase()}">`
              openTags.push(`bg-${bgColorClass.toLowerCase()}`)
            }
            break
        }
      }

      match = ansiRegex.exec(text)
    }

    result += this.escapeHtml(text.slice(lastIndex))

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