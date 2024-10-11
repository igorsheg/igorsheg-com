import type { INode } from '../fs'
import type { OutputStream } from '../io'
import type { Command, CommandArgs } from './types'

export class LsCommand implements Command {
  name = 'ls'
  description = 'List directory contents'
  isBuiltin = true as const

  execute({ args, fs, shellState, stdout }: CommandArgs): void {
    let showHidden = false
    let longFormat = false
    let targetPath = shellState.getCwd()

    // Parse flags and path
    args.forEach((arg) => {
      if (arg.startsWith('-')) {
        if (arg.includes('a'))
          showHidden = true
        if (arg.includes('l'))
          longFormat = true
      }
      else {
        targetPath = shellState.resolveAbsolutePath(arg)
      }
    })

    const stat = fs.stat(targetPath)
    if (!stat) {
      stdout.write(`ls: cannot access '${targetPath}': No such file or directory\n`)
      return
    }

    if (stat.type === 'file') {
      this.displayFileInfo(stdout, targetPath.split('/').pop() || '', stat, longFormat)
      return
    }

    let contents = fs.ls(targetPath)
    if (contents) {
      if (!showHidden) {
        contents = contents.filter(item => !item.startsWith('.'))
      }

      if (longFormat) {
        contents.forEach((item) => {
          const itemPath = `${targetPath}/${item}`
          const itemStat = fs.stat(itemPath)
          if (itemStat) {
            this.displayFileInfo(stdout, item, itemStat, longFormat)
          }
        })
      }
      else {
        stdout.write(`${contents.join('\n')}\n`)
      }
    }
  }

  private displayFileInfo(stdout: OutputStream, name: string, stat: INode, longFormat: boolean): void {
    if (longFormat) {
      const type = stat.type === 'dir' ? 'd' : '-'
      const date = this.formatDate(stat.metadata.dateCreated)
      stdout.write(`${type}rw-r--r-- 1 igorsheg wheel 4096 ${date} ${name}${stat.type === 'dir' ? '/' : ''}\n`)
    }
    else {
      stdout.write(`${name}${stat.type === 'dir' ? '/' : ''}\n`)
    }
  }

  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month} ${day} ${hours}:${minutes}`
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

