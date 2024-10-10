import type { CommandRegistry } from '../command'
import type { OutputStream } from '../io'
import type { Command } from './types'

export class HelpCommand implements Command {
  name = 'help'
  description = 'Display available commands'

  constructor(private commandRegistry: CommandRegistry) { }

  execute(args: string[], stdout: OutputStream): void {
    stdout.write('Available commands:\n')
    this.commandRegistry.getCommands().forEach((command) => {
      stdout.write(`  ${command.name}: ${command.description}\n`)
    })
  }
}
