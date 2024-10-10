import type { InMemoryFileSystem } from '../fs'
import type { InputStream, OutputStream } from '../io'
import type { Command } from './types'

export class CdCommand implements Command {
  name = 'cd'
  description = 'Change the current directory'

  execute(args: string[], fs: InMemoryFileSystem, _stdin: InputStream, stdout: OutputStream): void {
    if (args.length !== 1) {
      stdout.write('Usage: cd <directory>\n')
      return
    }

    try {
      fs.chdir(args[0])
    }
    catch (error) {
      if (error instanceof Error) {
        stdout.write(`${error.message}\n`)
      }
    }
  }
}
