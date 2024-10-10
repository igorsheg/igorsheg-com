import { AboutCommand, CatCommand, CdCommand, HelpCommand, LsCommand, PwdCommand } from './bin'
import { CommandRegistry } from './command'
import { InMemoryFileSystem } from './fs'
import { InputStream, OutputStream } from './io'
import { Shell } from './shell'
import { Terminal } from './terminal'
import './style.css'

const fileSystem = new InMemoryFileSystem(globalThis.location.origin)
const terminalElement = document.getElementById('terminal') as HTMLElement
const stdin = new InputStream()
const stdout = new OutputStream()

const commandRegistry = new CommandRegistry()
commandRegistry.registerCommand(new HelpCommand(commandRegistry))
commandRegistry.registerCommand(new AboutCommand())
commandRegistry.registerCommand(new CdCommand())
commandRegistry.registerCommand(new PwdCommand())
commandRegistry.registerCommand(new LsCommand())
commandRegistry.registerCommand(new CatCommand())

const terminal = new Terminal(terminalElement, stdin, stdout, commandRegistry)
const shell = new Shell(stdin, stdout, commandRegistry, fileSystem)

shell.run()

document.addEventListener('load', () => terminal.focus())
