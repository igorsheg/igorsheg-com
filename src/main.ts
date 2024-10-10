import { InputStream, OutputStream } from './io'
import { Shell } from './shell'
import { Terminal } from './terminal'
import './style.css'

const terminalElement = document.getElementById('terminal') as HTMLElement
const stdin = new InputStream()
const stdout = new OutputStream()
const stderr = new OutputStream()

const terminal = new Terminal(terminalElement, stdin, stdout)
const shell = new Shell(stdin, stdout, stderr)

shell.run()

document.addEventListener('load', () => terminal.focus())