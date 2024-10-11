import type { Command, CommandArgs } from './types'
import { DataBlock } from '../fs'

export class CatCommand implements Command {
  name = 'cat'
  description = 'Display the contents of a file'
  isBuiltin = true as const

  async execute({ args, shellState, stdout, fs }: CommandArgs): Promise<void> {
    if (args.length !== 1) {
      stdout.write('Usage: cat <filename>\n')
      return
    }
    const filePath = shellState.resolveAbsolutePath(args[0])
    const stat = fs.stat(filePath)
    if (!stat || stat.type !== 'file') {
      stdout.write(`cat: ${args[0]}: No such file\n`)
      return
    }
    try {
      let content: string = ''
      if (stat.content instanceof DataBlock) {
        content = await stat.content.read()
      }
      else {
        content = stat.content
      }
      stdout.write(`${content}\n`)
    }
    catch (error) {
      stdout.write(`cat: ${args[0]}: ${(error as Error).message}\n`)
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
          const completedStat = fs.stat(shellState.resolveAbsolutePath(completedPath))
          return completedStat?.type === 'dir' ? `${completedPath}/` : completedPath
        })
    }
    catch (error) {
      console.error('Error in cat completion:', error)
      return []
    }
  }
}
