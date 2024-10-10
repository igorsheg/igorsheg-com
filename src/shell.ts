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
}