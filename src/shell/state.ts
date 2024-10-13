export class ShellState {
  private user: string
  private currentDirectory: string = '/'
  private history: string[] = []
  private dirHistory: string[] = ['/']

  constructor(user: string) {
    this.user = user
    this.currentDirectory = `/home/${this.user}`
  }

  getCwd(): string {
    return this.currentDirectory
  }

  updateCwd(newCwd: string): void {
    this.currentDirectory = newCwd
    this.addToDirHistory(newCwd)
  }

  getDirHistory(): string[] {
    return [...this.dirHistory]
  }

  private addToDirHistory(path: string): void {
    this.dirHistory.push(path)
  }

  resolveAbsolutePath(path: string): string {
    if (path.startsWith('/')) {
      return path
    }
    const parts = [...this.currentDirectory.split('/').filter(Boolean), ...path.split('/').filter(Boolean)]
    const resolvedParts: string[] = []
    for (const part of parts) {
      if (part === '..') {
        resolvedParts.pop()
      }
      else if (part !== '.') {
        resolvedParts.push(part)
      }
    }
    return `/${resolvedParts.join('/')}`
  }

  getHistory(): string[] {
    return [...this.history]
  }

  addToHistory(command: string): void {
    this.history.push(command)
  }

  clearHistory(): void {
    this.history = []
  }
}