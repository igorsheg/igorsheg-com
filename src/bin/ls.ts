import type { InMemoryFileSystem } from '../fs'
import type { InputStream, OutputStream } from '../io'
import type { Command } from './types'

export class LsCommand implements Command {
  name = 'ls'
  description = 'List directory contents'

  execute(args: string[], fs: InMemoryFileSystem, _stdin: InputStream, stdout: OutputStream): void {
    const path = args.length > 0 ? args[0] : fs.getCwd()
    try {
      const contents = fs.listDirectory(fs.getAbsolutePath(path))
      stdout.write(`${contents.join('\n')}\n`)
    }
    catch (error) {
      if (error instanceof Error) {
        stdout.write(`ls: ${path}: ${error.message}\n`)
      }
    }
  }
}