import type { InMemoryFileSystem, InputStream, OutputStream } from '../lib'
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
      console.error('Error in ls completion:', error)
      return []
    }
  }
}
