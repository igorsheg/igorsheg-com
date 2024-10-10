import type { InMemoryFileSystem } from '../fs'
import type { InputStream, OutputStream } from '../io'
import type { Command } from './types'

export class PwdCommand implements Command {
  name = 'pwd'
  description = 'Print the current working directory'

  execute(_args: string[], fs: InMemoryFileSystem, _stdin: InputStream, stdout: OutputStream): void {
    stdout.write(`${fs.getCwd()}\n`)
  }
}