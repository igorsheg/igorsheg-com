import type { InMemoryFileSystem } from '../fs'
import type { InputStream, OutputStream } from '../io'

export interface Command {
  name: string
  description: string
  execute: (args: string[], fs: InMemoryFileSystem, stdin: InputStream, stdout: OutputStream) => void
  complete?: (args: string[], fs: InMemoryFileSystem) => string[]
}
