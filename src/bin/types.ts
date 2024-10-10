import type { OutputStream } from '../io'

export interface Command {
  name: string
  description: string
  execute: (args: string[], stdout: OutputStream) => void
}
