export class DataBlock {
  fileUrl: string

  constructor(fileUrl: string) {
    this.fileUrl = fileUrl
  }

  async read(): Promise<string> {
    try {
      const response = await fetch(this.fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${this.fileUrl}`)
      }
      const text = await response.text()
      return text
    }
    catch (error) {
      throw new Error(`Error reading file: ${(error as Error).message}`)
    }
  }
}

export type INodeMetadata = {
  dateCreated: Date
}

export type DirINode = {
  type: 'dir'
  children: Map<string, INode>
  metadata: INodeMetadata
}

export type FileINode = {
  type: 'file'
  content: DataBlock | string
  metadata: INodeMetadata
}

export type INode = FileINode | DirINode

export class VirtualFileSystem {
  root: DirINode

  constructor(tree?: DirINode) {
    this.root = tree ?? { type: 'dir', children: new Map(), metadata: { dateCreated: new Date() } }
  }

  stat(path: string): INode | null {
    const parts = path.split('/').filter(Boolean)
    let current: INode = this.root
    for (const part of parts) {
      if (current.type === 'file') {
        return null
      }
      const next = current.children.get(part)
      if (!next) {
        return null
      }
      current = next
    }
    return current
  }

  mkdir(path: string, parents: boolean = false): boolean {
    const parts = path.split('/').filter(Boolean)
    let current = this.root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if ((current as INode).type === 'file') {
        return false
      }

      const next = current.children.get(part)
      if (!next) {
        if (i < parts.length - 1 && !parents) {
          return false
        }
        // Create the missing directory
        const newDir: DirINode = { type: 'dir', children: new Map(), metadata: { dateCreated: new Date() } }
        current.children.set(part, newDir)
        current = newDir
      }
      else if (next.type === 'dir') {
        current = next
      }
      else {
        // A file exists with this name
        return false
      }
    }

    return true
  }

  touch(path: string, content: string = ''): boolean {
    const parts = path.split('/').filter(Boolean)
    const fileName = parts.pop()
    if (!fileName) {
      return false
    }

    const dirPath = `/${parts.join('/')}`
    const parentDir = this.stat(dirPath)

    if (!parentDir || parentDir.type !== 'dir') {
      return false
    }

    const existingNode = parentDir.children.get(fileName)
    if (existingNode) {
      if (existingNode.type === 'file') {
        // Update the existing file's content
        existingNode.content = new DataBlock(content)
        return true
      }
      return false
    }

    const newFile: FileINode = {
      type: 'file',
      content: new DataBlock(content),
      metadata: { dateCreated: new Date() },
    }

    parentDir.children.set(fileName, newFile)
    return true
  }

  rm(path: string, recursive: boolean = false): boolean {
    const parts = path.split('/').filter(Boolean)
    const nodeName = parts.pop()
    if (!nodeName) {
      return false
    }

    const parentPath = `/${parts.join('/')}`
    const parentDir = this.stat(parentPath)

    if (!parentDir || parentDir.type !== 'dir') {
      return false
    }

    const nodeToRemove = parentDir.children.get(nodeName)
    if (!nodeToRemove) {
      return false
    }

    if (nodeToRemove.type === 'dir' && !recursive) {
      return false
    }

    return parentDir.children.delete(nodeName)
  }

  ls(path: string): string[] | null {
    const node = this.stat(path)
    if (!node) {
      return null
    }
    if (node.type === 'file') {
      return [path.split('/').pop() || '']
    }
    return Array.from(node.children.keys())
  }

  resolveAbsolutePath(cwd: string, path: string): string {
    if (path.startsWith('/')) {
      return path
    }
    const parts = [...cwd.split('/').filter(Boolean), ...path.split('/').filter(Boolean)]
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