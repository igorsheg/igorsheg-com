export class ShellState {
  private currentDirectory: string = '/'
  private dirHistory: string[] = ['/']

  getCwd(): string {
    return this.currentDirectory
  }

  updateCwd(newCwd: string): void {
    this.currentDirectory = newCwd
    this.addToHistory(newCwd)
  }

  getDirHistory(): string[] {
    return [...this.dirHistory]
  }

  private addToHistory(path: string): void {
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
}
