export class TerminalRenderer {
  private container: HTMLElement
  private outputElement: HTMLElement
  private inputElement: HTMLElement
  private completionsElement: HTMLElement
  private ansiParser: AnsiParser

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

    this.ansiParser = new AnsiParser()
  }

  render(output: string[], currentPrompt: string, currentInput: string, completions: string[], selectedIndex: number): void {
    this.renderOutput(output)
    this.renderInput(currentPrompt, currentInput)
    this.renderCompletions(completions, selectedIndex)
    this.scrollToBottom()
  }

  private renderOutput(output: string[]): void {
    const fragment = document.createDocumentFragment()
    output.forEach((line) => {
      const div = document.createElement('div')
      div.className = 'command-output'
      div.appendChild(this.ansiParser.parse(line))
      fragment.appendChild(div)
    })
    this.outputElement.innerHTML = ''
    this.outputElement.appendChild(fragment)
  }

  private renderInput(prompt: string, input: string): void {
    const inputDiv = document.createElement('div')
    inputDiv.className = 'command-input'

    const parsedPrompt = this.ansiParser.parse(prompt)
    const parsedInput = this.ansiParser.parse(this.preserveSpaces(input))

    inputDiv.appendChild(parsedPrompt)
    inputDiv.appendChild(parsedInput)

    const cursor = document.createElement('span')
    cursor.className = 'cursor'
    cursor.textContent = '█'
    inputDiv.appendChild(cursor)

    this.inputElement.innerHTML = ''
    this.inputElement.appendChild(inputDiv)
  }

  private preserveSpaces(text: string): string {
    return text.replace(/ /g, '\u00A0') // Replace spaces with non-breaking spaces
  }

  private renderCompletions(completions: string[], selectedIndex: number): void {
    this.completionsElement.innerHTML = ''
    if (completions.length > 0) {
      const fragment = document.createDocumentFragment()
      completions.forEach((completion, index) => {
        const div = document.createElement('div')
        div.textContent = completion
        if (index === selectedIndex) {
          div.className = 'selected'
        }
        fragment.appendChild(div)
      })
      this.completionsElement.appendChild(fragment)
      this.completionsElement.style.display = 'block'
    }
    else {
      this.completionsElement.style.display = 'none'
    }
  }

  private scrollToBottom(): void {
    this.container.scrollTop = this.container.scrollHeight
  }

  clear(): void {
    this.outputElement.innerHTML = ''
  }
}

class AnsiParser {
  private openTags: { className: string, element: HTMLSpanElement }[] = []

  parse(text: string): DocumentFragment {
    const fragment = document.createDocumentFragment()
    const ansiRegex = /\x1B\[([0-9;]*)m/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = ansiRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        this.appendTextToCurrentSpan(fragment, text.slice(lastIndex, match.index))
      }
      this.parseAnsiCode(match[1], fragment)
      lastIndex = ansiRegex.lastIndex
    }

    if (lastIndex < text.length) {
      this.appendTextToCurrentSpan(fragment, text.slice(lastIndex))
    }

    this.closeAllTags(fragment)
    return fragment
  }

  private appendTextToCurrentSpan(fragment: DocumentFragment, text: string): void {
    if (this.openTags.length === 0) {
      fragment.appendChild(document.createTextNode(text))
    }
    else {
      this.openTags[this.openTags.length - 1].element.appendChild(document.createTextNode(text))
    }
  }

  private parseAnsiCode(code: string, fragment: DocumentFragment): void {
    const codes = code.split(';').map(Number)
    for (const code of codes) {
      this.applySingleCode(code, fragment)
    }
  }

  private applySingleCode(code: number, fragment: DocumentFragment): void {
    switch (code) {
      case 0: // Reset
        this.closeAllTags(fragment)
        break
      case 1: // Bold
      case 2: // Dim
      case 3: // Italic
      case 4: // Underline
      case 5: // Blink
      case 7: // Reverse
      case 8: // Hidden
        this.openTag(this.getClassForCode(code), fragment)
        break
      case 30: case 31: case 32: case 33: case 34: case 35: case 36: case 37:
      case 90: case 91: case 92: case 93: case 94: case 95: case 96: case 97:
        this.openTag(this.getColorClassForCode(code), fragment)
        break
      case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47:
      case 100: case 101: case 102: case 103: case 104: case 105: case 106: case 107:
        this.openTag(this.getBackgroundColorClassForCode(code), fragment)
        break
    }
  }

  private getClassForCode(code: number): string {
    const classes = ['bold', 'dim', 'italic', 'underline', 'blink', '', 'reverse', 'hidden']
    return classes[code - 1] || ''
  }

  private getColorClassForCode(code: number): string {
    const colors = [
      'black',
      'red',
      'green',
      'yellow',
      'blue',
      'magenta',
      'cyan',
      'white',
      'bright-black',
      'bright-red',
      'bright-green',
      'bright-yellow',
      'bright-blue',
      'bright-magenta',
      'bright-cyan',
      'bright-white',
    ]
    return colors[code - 30] || colors[code - 90 + 8] || ''
  }

  private getBackgroundColorClassForCode(code: number): string {
    const colors = [
      'bg-black',
      'bg-red',
      'bg-green',
      'bg-yellow',
      'bg-blue',
      'bg-magenta',
      'bg-cyan',
      'bg-white',
      'bg-bright-black',
      'bg-bright-red',
      'bg-bright-green',
      'bg-bright-yellow',
      'bg-bright-blue',
      'bg-bright-magenta',
      'bg-bright-cyan',
      'bg-bright-white',
    ]
    return colors[code - 40] || colors[code - 100 + 8] || ''
  }

  private openTag(className: string, fragment: DocumentFragment): void {
    if (className) {
      const span = document.createElement('span')
      span.className = className
      if (this.openTags.length === 0) {
        fragment.appendChild(span)
      }
      else {
        this.openTags[this.openTags.length - 1].element.appendChild(span)
      }
      this.openTags.push({ className, element: span })
    }
  }

  private closeAllTags(_fragment: DocumentFragment): void {
    this.openTags = []
  }
}