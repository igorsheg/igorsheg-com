import type { Command, CommandArgs } from './types'

export class PwdCommand implements Command {
  name = 'pwd'
  description = 'Print the current working directory'
  isBuiltin = true as const

  execute({ stdout, shellState }: CommandArgs): void {
    stdout.write(`${shellState.getCwd()}\n`)
  }
}
