import type { Command, CommandArgs } from './types'

export class LsCommand implements Command {
  name = 'ls'
  description = 'List directory contents'
  isBuiltin = true as const

  execute({ args, fs, shellState, stdout }: CommandArgs): void {
    const path = args.length > 0 ? shellState.resolveAbsolutePath(args[0]) : shellState.getCwd()
    const stat = fs.stat(path)
    if (!stat) {
      stdout.write(`ls: cannot access '${args[0]}': No such file or directory\n`)
      return
    }
    if (stat.type === 'file') {
      stdout.write(`${path.split('/').pop()}\n`)
      return
    }
    const contents = fs.ls(path)
    if (contents) {
      stdout.write(`${contents.join('\n')}\n`)
    }
  }

  complete({ args, fs, shellState }: CommandArgs): string[] {
    const partialPath = args[args.length - 1] || ''
    const fullPath = shellState.resolveAbsolutePath(partialPath)
    try {
      let items: string[]
      let prefix: string
      const stat = fs.stat(fullPath)
      if (stat && stat.type === 'dir') {
        items = fs.ls(fullPath) || []
        prefix = ''
      }
      else {
        const parentDir = fullPath.split('/').slice(0, -1).join('/')
        items = fs.ls(parentDir) || []
        prefix = fullPath.split('/').pop() || ''
      }
      return items
        .filter(item => item.startsWith(prefix))
        .map((item) => {
          const completedPath = partialPath + item.slice(prefix.length)
          return `${completedPath}${fs.stat(shellState.resolveAbsolutePath(completedPath))?.type === 'dir' ? '/' : ''}`
        })
    }
    catch (error) {
      console.error('Error in ls completion:', error)
      return []
    }
  }
}
