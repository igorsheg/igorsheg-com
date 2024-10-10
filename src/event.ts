import type { Terminal } from './terminal'

export class TerminalEventHandler {
  constructor(private terminal: Terminal) { }

  handleEvent(event: KeyboardEvent): void {
    event.preventDefault()

    switch (event.key) {
      case 'Enter':
        this.handleEnter()
        break
      case 'Backspace':
        this.handleBackspace()
        break
      default:
        this.handleCharacterInput(event.key)
    }

    this.terminal.render()
  }

  private handleEnter(): void {
    const currentInput = this.terminal.getCurrentInput()
    // this.terminal.addToOutput(this.terminal.getPrompt() + currentInput)
    this.terminal.sendInput(currentInput)
    this.terminal.clearCurrentInput()
  }

  private handleBackspace(): void {
    this.terminal.backspace()
  }

  private handleCharacterInput(char: string): void {
    if (char.length === 1) {
      this.terminal.appendToInput(char)
    }
  }
}
