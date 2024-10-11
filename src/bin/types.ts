import type { VirtualFileSystem } from '../fs'
import type { InputStream, OutputStream } from '../io'
import type { ShellState } from '../shellState'

export interface CommandArgs {
  args: string[]
  shellState: ShellState
  fs: VirtualFileSystem
  stdin: InputStream
  stdout: OutputStream
}

export interface Command {
  name: string
  description: string
  execute: (args: CommandArgs) => void | Promise<void>
  complete?: (args: CommandArgs) => string[]
}

export interface BuiltinCommand extends Command {
  isBuiltin: true
}