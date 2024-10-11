import type { CommandRegistry } from '../command'
import type { Command, CommandArgs } from './types'

export class HelpCommand implements Command {
  name = 'help'
  description = 'Display available commands'

  constructor(private commandRegistry: CommandRegistry) { }

  execute({ stdout }: CommandArgs): void {
    stdout.write('Usage:\n')
    stdout.write('  command [options]\n\n')
    stdout.write('Available commands:\n')

    this.commandRegistry.getAllCommands().forEach((command) => {
      stdout.write(`  ${command.name}\n`)
      stdout.write(`      ${command.description}\n\n`)
    })

    stdout.write('Use "command --help" for more information about a command.\n')
  }
}