import { AboutCommand, HelpCommand } from './bin'
import { CommandRegistry } from './command'
import { InputStream, OutputStream } from './io'
import { Shell } from './shell'
import { Terminal } from './terminal'
import './style.css'

const terminalElement = document.getElementById('terminal') as HTMLElement
const stdin = new InputStream()
const stdout = new OutputStream()

const commandRegistry = new CommandRegistry()
commandRegistry.registerCommand(new HelpCommand(commandRegistry))
commandRegistry.registerCommand(new AboutCommand())

const terminal = new Terminal(terminalElement, stdin, stdout, commandRegistry)
const shell = new Shell(stdin, stdout, commandRegistry)

shell.run()

document.addEventListener('load', () => terminal.focus())
