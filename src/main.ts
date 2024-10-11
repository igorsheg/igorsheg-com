import type { CompletionResult } from './shell'
import { AboutCommand, CatCommand, CdCommand, HelpCommand, LsCommand, PwdCommand } from './bin'
import { ContactCommand } from './bin/contact'
import { CommandRegistry } from './command'
import { VirtualFileSystem } from './fs'
import { InputStream, OutputStream } from './io'
import { Shell } from './shell'
import { Terminal } from './terminal'
import './style.css'

const terminalElement = document.getElementById('terminal') as HTMLElement
const stdin = new InputStream()
const stdout = new OutputStream()

const vfs = new VirtualFileSystem()
vfs.mkdir('/home/igorsheg/projects', true)
vfs.touch('/home/igorsheg/projects/igorsheg.txt', '/projects/igorsheg.txt')
vfs.touch('/home/igorsheg/about.txt', '/about.txt')

const cmdReg = new CommandRegistry()
cmdReg.registerExternal(new HelpCommand(cmdReg))
cmdReg.registerExternal(new AboutCommand())
cmdReg.registerBuiltin(new CdCommand())
cmdReg.registerBuiltin(new PwdCommand())
cmdReg.registerBuiltin(new LsCommand())
cmdReg.registerBuiltin(new CatCommand())
cmdReg.registerExternal(new ContactCommand())

const shell = new Shell(stdin, stdout, cmdReg, vfs)
const terminal = new Terminal(
  terminalElement,
  stdout,
  (input) => {
    stdin.write(input)
  },
  (line, direction): CompletionResult => shell.complete(line, direction),
  () => shell.getPrompt(),
)

terminal.focus()
