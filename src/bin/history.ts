import type { Command, CommandArgs } from './types'

export class HistoryCommand implements Command {
  name = 'history'
  description = 'Display or manipulate the command history'
  isBuiltin = true as const

  execute({ args, shellState, stdout }: CommandArgs): void {
    const history = shellState.getHistory()

    if (args.length === 0) {
      history.forEach((cmd, index) => {
        stdout.write(`${index + 1}  ${cmd}\n`)
      })
    }
    else if (args.length === 1) {
      const arg = args[0]
      if (arg === '-c' || arg === '--clear') {
        shellState.clearHistory()
        stdout.write('History cleared.\n')
      }
      else if (arg.startsWith('-')) {
        stdout.write(`history: invalid option: ${arg}\n`)
        stdout.write('Usage: history [-c] [n]\n')
      }
      else {
        const n = Number.parseInt(arg, 10)
        if (Number.isNaN(n)) {
          stdout.write(`history: ${arg}: numeric argument required\n`)
          return
        }
        const lastN = history.slice(-n)
        lastN.forEach((cmd, index) => {
          stdout.write(`${history.length - lastN.length + index + 1}  ${cmd}\n`)
        })
      }
    }
    else {
      stdout.write('Usage: history [-c] [n]\n')
    }
  }

  complete({ args }: CommandArgs): string[] {
    if (args.length === 1) {
      const options = ['-c', '--clear']
      const partialArg = args[0]
      return options.filter(option => option.startsWith(partialArg))
    }
    return []
  }
}
