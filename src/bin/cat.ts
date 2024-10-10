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

  complete(args: string[], fs: InMemoryFileSystem): string[] {
    const partialPath = args[args.length - 1] || ''
    const fullPath = fs.getAbsolutePath(partialPath)

    try {
      let items: string[]
      let prefix: string
      if (fs.isDirectory(fullPath)) {
        items = fs.listDirectory(fullPath)
        prefix = ''
      }
      else {
        const parentDir = fs.getParentDirectory(fullPath)
        items = fs.listDirectory(parentDir)
        prefix = fullPath.split('/').pop() || ''
      }

      const completions = items
        .filter(item => item.startsWith(prefix))
        .map((item) => {
          const completedPath = partialPath + item.slice(prefix.length)
          const fullCompletedPath = fs.getAbsolutePath(completedPath)
          return fs.isDirectory(fullCompletedPath) ? `${completedPath}/` : completedPath
        })

      return completions
    }
    catch (error) {
      console.error('Error in cat completion:', error)
      return []
    }
  }
}

