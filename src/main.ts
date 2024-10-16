import { AnimateCommand, CatCommand, CdCommand, ContactCommand, HelpCommand, LsCommand, PwdCommand } from './bin'
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
vfs.touch('/home/igorsheg/projects/setup.txt', '/projects/setup.txt')
vfs.touch('/home/igorsheg/projects/typedkey.txt', '/projects/typedkey.txt')
vfs.touch('/home/igorsheg/about.txt', '/about.txt')

const cmdReg = new CommandRegistry()
cmdReg.registerBuiltin(new CdCommand())
cmdReg.registerBuiltin(new PwdCommand())
cmdReg.registerBuiltin(new LsCommand())
cmdReg.registerBuiltin(new CatCommand())
cmdReg.registerExternal(new ContactCommand())
cmdReg.registerExternal(new HelpCommand(cmdReg))
cmdReg.registerExternal(new AnimateCommand())

const shell = new Shell('igorsheg', stdin, stdout, cmdReg, vfs)
const terminal = new Terminal(
  terminalElement,
  stdout,
  stdin.write.bind(stdin),
  shell.complete.bind(shell),
  shell.getPrompt.bind(shell),
  shell.isValidCommand.bind(shell),
)

terminal.focus()
