import type { Command } from './bin/types'
import type { OutputStream } from './io'

export class CommandRegistry {
  private commands: Map<string, Command> = new Map()

  registerCommand(command: Command): void {
    this.commands.set(command.name, command)
  }

  executeCommand(name: string, args: string[], stdout: OutputStream): void {
    const command = this.commands.get(name)
    if (command) {
      command.execute(args, stdout)
    }
    else {
      stdout.write(`Command not found: ${name}\n`)
    }
  }

  commandExists(name: string): boolean {
    return this.commands.has(name)
  }

  getCommands(): Command[] {
    return Array.from(this.commands.values())
  }
}
