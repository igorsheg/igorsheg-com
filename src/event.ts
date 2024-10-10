import type { CommandRegistry } from './command'
import type { InMemoryFileSystem } from './fs'
import type { Terminal } from './terminal'

export class TerminalEventHandler {
  constructor(
    private terminal: Terminal,
    private fileSystem: InMemoryFileSystem,
    private commandRegistry: CommandRegistry,
  ) { }

  handleEvent(event: KeyboardEvent): void {
    event.preventDefault()
    switch (event.key) {
      case 'Enter':
        this.handleEnter()
        break
      case 'Backspace':
        this.handleBackspace()
        break
      case 'Tab':
        this.handleTab()
        break
      default:
        this.handleCharacterInput(event.key)
    }
    this.terminal.render()
  }

  private handleEnter(): void {
    const currentInput = this.terminal.getCurrentInput()
    this.terminal.addToOutput(this.terminal.getPrompt() + currentInput)
    this.terminal.sendInput(currentInput)
    this.terminal.clearCurrentInput()
  }

  private handleBackspace(): void {
    this.terminal.backspace()
  }

  private handleTab(): void {
    const currentInput = this.terminal.getCurrentInput()
    const [command, ...args] = currentInput.trim().split(/\s+/)

    if (args.length === 0) {
      const suggestions = this.getCommandSuggestions(command)
      this.handleSuggestions(suggestions, currentInput)
    }
    else if (command === 'cat' || command === 'cd') {
      const partialPath = args.join(' ')
      const suggestions = this.fileSystem.getSuggestions(partialPath)
      this.handleSuggestions(suggestions, currentInput, `${command} `)
    }
  }

  private getCommandSuggestions(partialCommand: string): string[] {
    return this.commandRegistry.getCommands()
      .map(cmd => cmd.name)
      .filter(name => name.startsWith(partialCommand))
  }

  private handleSuggestions(suggestions: string[], currentInput: string, prefix: string = ''): void {
    if (suggestions.length === 1) {
      // If there's only one suggestion, complete it
      this.terminal.setCurrentInput(`${prefix}${suggestions[0]}`)
    }
    else if (suggestions.length > 1) {
      // If there are multiple suggestions, display them
      this.terminal.setCurrentInput(currentInput)
      this.terminal.addToOutput(suggestions.join('  '))
    }
  }

  private handleCharacterInput(char: string): void {
    if (char.length === 1) {
      this.terminal.appendToInput(char)
    }
  }
}
