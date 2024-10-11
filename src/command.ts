import type { BuiltinCommand, Command } from './bin/types'

export class CommandRegistry {
  private builtins: Map<string, BuiltinCommand> = new Map()
  private externalCommands: Map<string, Command> = new Map()

  registerBuiltin(command: BuiltinCommand): void {
    this.builtins.set(command.name, command)
  }

  registerExternal(command: Command): void {
    this.externalCommands.set(command.name, command)
  }

  getCommand(name: string): Command | undefined {
    return this.builtins.get(name) || this.externalCommands.get(name)
  }

  getAllCommands(): Command[] {
    return [...this.builtins.values(), ...this.externalCommands.values()]
  }

  getCommandNames(): string[] {
    return [...this.builtins.keys(), ...this.externalCommands.keys()]
  }
}
