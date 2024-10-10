import type { InputStream, OutputStream } from './io'
import { AboutCommand, HelpCommand } from './bin'
import { CommandRegistry } from './command'

export class Shell {
  private commandRegistry: CommandRegistry

  constructor(
    private stdin: InputStream,
    private stdout: OutputStream,
  ) {
    this.commandRegistry = new CommandRegistry()
    this.registerCommands()
  }

  private registerCommands(): void {
    this.commandRegistry.registerCommand(new HelpCommand(this.commandRegistry))
    this.commandRegistry.registerCommand(new AboutCommand())
  }

  run(): void {
    this.stdin.onData(this.handleInput.bind(this))
  }

  private handleInput(input: string): void {
    const [command, ...args] = input.trim().split(/\s+/)
    if (command === 'clear') {
      this.stdout.write('\x1B[2J\x1B[0f')
    }
    else if (command !== '') {
      this.commandRegistry.executeCommand(command, args, this.stdout)
    }
  }
}