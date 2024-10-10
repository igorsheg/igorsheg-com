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
        .filter(item => item.startsWith(prefix) && fs.isDirectory(fs.getAbsolutePath(fs.joinPaths(fs.getParentDirectory(fullPath), item))))
        .map((item) => {
          const completedPath = partialPath + item.slice(prefix.length)
          return `${completedPath}/`
        })

      return completions
    }
    catch (error) {
      console.error('Error in cd completion:', error)
      return []
    }
  }
}
