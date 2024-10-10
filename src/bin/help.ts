import type { CommandRegistry, InMemoryFileSystem, InputStream, OutputStream } from '../lib'
import type { Command } from './types'

export class HelpCommand implements Command {
  name = 'help'
  description = 'Display available commands'

  constructor(private commandRegistry: CommandRegistry) { }

  execute(_args: string[], _fs: InMemoryFileSystem, _stdin: InputStream, stdout: OutputStream): void {
    stdout.write('Usage:\n')
    stdout.write('  command [options]\n\n')
    stdout.write('Available commands:\n')

    this.commandRegistry.getCommands().forEach((command) => {
      stdout.write(`  ${command.name}\n`)
      stdout.write(`      ${command.description}\n\n`)
    })

    stdout.write('Use "command --help" for more information about a command.\n')
  }
}
