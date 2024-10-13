import type { ShellState } from './state'
import { ANSI } from '../lib'

export class MinimalistPrompt {
  constructor(private state: ShellState) { }

  private getUsername(): string {
    return 'igorsheg'
  }

  private getHostname(): string {
    return 'portfolio'
  }

  private formatPath(path: string): string {
    const homedir = `/home/${this.getUsername()}`
    if (path.startsWith(homedir)) {
      return `~${path.slice(homedir.length)}`
    }
    return path
  }

  private truncatePath(path: string, maxLength: number = 30): string {
    if (path.length <= maxLength)
      return path
    const segments = path.split('/')
    let result = ''
    let i = segments.length - 1
    while (i >= 0 && (result.length + segments[i].length + 1) <= maxLength) {
      result = `/${segments[i]}${result}`
      i--
    }
    return (i >= 0 ? '…' : '') + result
  }

  get prompt(): string {
    const username = this.getUsername()
    const hostname = this.getHostname()
    const cwd = this.truncatePath(this.formatPath(this.state.getCwd()))

    const userHost = `${ANSI.BOLD}${ANSI.FG.GREEN}${username}${ANSI.RESET}${ANSI.BOLD}@${ANSI.FG.BRIGHT_WHITE}${hostname}${ANSI.RESET}`
    const directory = `${ANSI.BOLD}${ANSI.FG.MAGENTA} in ${cwd} ${ANSI.RESET}`
    const promptSymbol = `${ANSI.BOLD}${ANSI.FG.GREEN}❯${ANSI.RESET}`

    return `${userHost}${directory}${promptSymbol}${ANSI.SPACE}`
  }
}
