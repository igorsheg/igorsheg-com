import type { CommandRegistry } from './command'
import type { InMemoryFileSystem } from './fs'
import type { InputStream, OutputStream } from './io'

export class Shell {
  constructor(
    private stdin: InputStream,
    private stdout: OutputStream,
    private commandRegistry: CommandRegistry,
    private fileSystem: InMemoryFileSystem,
  ) { }

  run(): void {
    this.stdin.onData(this.handleInput.bind(this))
  }

  private handleInput(input: string): void {
    const [command, ...args] = input.trim().split(/\s+/)
    if (command === 'clear') {
      this.stdout.write('\x1B[2J\x1B[0f')
    }
    else if (command !== '') {
      this.commandRegistry.executeCommand(command, args, this.fileSystem, this.stdin, this.stdout)
    }
  }

  completeInput(input: string): string[] {
    const tokens = input.trim().split(/\s+/)
    const commandName = tokens[0]
    const args = tokens.slice(1)

    // If command exists and has a complete method, use it
    const command = this.commandRegistry.getCommand(commandName)

    if (command && command.complete) {
      return command.complete(args, this.fileSystem)
    }
    else if (tokens.length === 1) {
      // Provide command name completions
      return this.commandRegistry.getCommandNames().filter(name => name.startsWith(commandName))
    }

    return []
  }
}
