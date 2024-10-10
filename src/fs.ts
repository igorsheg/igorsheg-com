interface FileSystemNode {
  name: string
  isDirectory: boolean
  content?: string
  children?: Map<string, FileSystemNode>
}

export class InMemoryFileSystem {
  private root: FileSystemNode
  private currentDirectory: string

  constructor(private baseUrl: string) {
    this.root = { name: '/', isDirectory: true, children: new Map() }
    this.currentDirectory = '/'
    this.initializeFileSystem()
  }

  private async initializeFileSystem(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/directory-structure.json`)
      const structure = await response.json()
      this.buildFileSystem(structure, this.root)
    }
    catch (error) {
      console.error('Failed to initialize file system:', error)
    }
  }

  private buildFileSystem(structure: any, node: FileSystemNode): void {
    for (const [name, details] of Object.entries(structure)) {
      if (typeof details === 'string') {
        // It's a file
        node.children!.set(name, { name, isDirectory: false, content: details })
      }
      else {
        // It's a directory
        const newNode: FileSystemNode = { name, isDirectory: true, children: new Map() }
        node.children!.set(name, newNode)
        this.buildFileSystem(details, newNode)
      }
    }
  }

  getCwd(): string {
    return this.currentDirectory
  }

  chdir(path: string): void {
    const resolvedPath = this.resolvePath(this.getAbsolutePath(path))
    if (resolvedPath && resolvedPath.isDirectory) {
      this.currentDirectory = this.getAbsolutePath(path)
    }
    else {
      throw new Error(`cd: ${path}: No such directory`)
    }
  }

  getAbsolutePath(path: string): string {
    if (path.startsWith('/')) {
      return path
    }
    return `${this.currentDirectory}${this.currentDirectory.endsWith('/') ? '' : '/'}${path}`
  }

  private resolvePath(path: string): FileSystemNode | null {
    const parts = path.split('/').filter(p => p !== '')
    let current = this.root
    for (const part of parts) {
      if (part === '..') {
        current = this.findParent(this.root, current) || this.root
      }
      else if (part !== '.') {
        const child = current.children!.get(part)
        if (!child)
          return null
        current = child
      }
    }
    return current
  }

  private findParent(node: FileSystemNode, target: FileSystemNode): FileSystemNode | null {
    for (const child of node.children!.values()) {
      if (child === target)
        return node
      if (child.isDirectory) {
        const result = this.findParent(child, target)
        if (result)
          return result
      }
    }
    return null
  }

  async readFile(path: string): Promise<string> {
    const node = this.resolvePath(path)
    if (!node || node.isDirectory) {
      throw new Error('File not found')
    }
    if (node.content) {
      try {
        const fullUrl = `${this.baseUrl}${node.content}`
        const response = await fetch(fullUrl)
        const content = await response.text()
        node.content = content // Cache
        return content
      }
      catch (error) {
        console.error(`Failed to read file ${path}:`, error)
        throw new Error('Failed to read file')
      }
    }
    throw new Error('File content not found')
  }

  listDirectory(path: string): string[] {
    const node = this.resolvePath(path)
    if (!node || !node.isDirectory) {
      throw new Error('Directory not found')
    }
    return Array.from(node.children!.keys())
  }

  isDirectory(path: string): boolean {
    const node = this.resolvePath(path)
    return node ? node.isDirectory : false
  }

  isFile(path: string): boolean {
    const node = this.resolvePath(path)
    return node ? !node.isDirectory : false
  }

  exists(path: string): boolean {
    return this.resolvePath(path) !== null
  }

  getSuggestions(partialPath: string, _options: { filesOnly?: boolean, directoriesOnly?: boolean } = {}): string[] {
    const { dir, base } = this.splitPath(partialPath)
    const dirNode = this.resolvePath(dir)

    if (!dirNode || !dirNode.isDirectory) {
      return []
    }

    return Array.from(dirNode.children!.keys())
      .filter(name => name.startsWith(base))
      .map(name => this.joinPaths(dir, name))
  }

  private splitPath(path: string): { dir: string, base: string } {
    const parts = path.split('/')
    const base = parts.pop() || ''
    const dir = parts.join('/') || '/'
    return { dir, base }
  }

  private joinPaths(...paths: string[]): string {
    return paths.join('/').replace(/\/+/g, '/')
  }
}