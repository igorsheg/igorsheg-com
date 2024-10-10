import type { InMemoryFileSystem } from '../fs'
import type { InputStream, OutputStream } from '../io'
import type { Command } from './types'

export class CatCommand implements Command {
  name = 'cat'
  description = 'Display the contents of a file'

  async execute(args: string[], fs: InMemoryFileSystem, _stdin: InputStream, stdout: OutputStream): Promise<void> {
    if (args.length !== 1) {
      stdout.write('Usage: cat <filename>\n')
      return
    }

    const filePath = fs.getAbsolutePath(args[0])
    try {
      const content = await fs.readFile(filePath)
      stdout.write(`${content}\n`)
    }
    catch (error) {
      stdout.write(`cat: ${args[0]}: ${(error as Error).message}\n`)
    }
  }
}
