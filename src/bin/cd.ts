import type { Command, CommandArgs } from './types'

export class CdCommand implements Command {
  name = 'cd'
  description = 'Change the current directory'
  isBuiltin = true as const

  execute({ args, fs, shellState, stdout }: CommandArgs): void {
    if (args.length !== 1) {
      stdout.write('Usage: cd <directory>\n')
      return
    }
    const newPath = shellState.resolveAbsolutePath(args[0])
    const stat = fs.stat(newPath)
    if (stat && stat.type === 'dir') {
      shellState.updateCwd(newPath)
    }
    else {
      stdout.write(`cd: ${args[0]}: No such directory\n`)
    }
  }

  complete({ args, shellState, fs }: CommandArgs): string[] {
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
      console.error('Error in cd completion:', error)
      return []
    }
  }
}
