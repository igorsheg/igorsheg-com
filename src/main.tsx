import type { CompletionResult } from './lib'
import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AboutCommand, CatCommand, CdCommand, HelpCommand, LsCommand, PwdCommand } from './bin'
import { ContactCommand } from './bin/contact'
import { CommandRegistry, InMemoryFileSystem, InputStream, OutputStream, Shell } from './lib'
import { Terminal } from './Terminal'
import './style.css'

const fileSystem = new InMemoryFileSystem(globalThis.location.origin)
const stdin = new InputStream()
const stdout = new OutputStream()
const cmdRegistry = new CommandRegistry()
cmdRegistry.registerCommand(new HelpCommand(cmdRegistry))
cmdRegistry.registerCommand(new AboutCommand())
cmdRegistry.registerCommand(new CdCommand())
cmdRegistry.registerCommand(new PwdCommand())
cmdRegistry.registerCommand(new LsCommand())
cmdRegistry.registerCommand(new CatCommand())
cmdRegistry.registerCommand(new ContactCommand())
const shell = new Shell(stdin, stdout, cmdRegistry, fileSystem)

function useTerminal() {
  const [output, setOutput] = useState<string[]>([])

  useEffect(() => {
    const handleStdout = (data: string) => {
      setOutput(() => [...data.split('\n').filter(line => line.trim() !== '')])
    }

    stdout.onWrite(handleStdout)

    return () => {
    }
  }, [])

  const handleInput = useCallback((input: string) => {
    setOutput(prev => [...prev, `${shell.getPrompt()}${input.trim()}`])
    stdin.write(input)
  }, [])

  const handleCompletion = useCallback((line: string, direction: number): CompletionResult => {
    return shell.complete(line, direction)
  }, [])

  const getPrompt = useCallback(() => {
    return shell.getPrompt()
  }, [])

  return { output, handleInput, handleCompletion, getPrompt }
}

function App() {
  const { output, handleInput, handleCompletion, getPrompt } = useTerminal()

  return (
    <div className="app-container">
      <Terminal
        stdout={stdout}
        onInputCallback={handleInput}
        completionFunction={handleCompletion}
        getPromptCallback={getPrompt}
        output={output}
      />
    </div>
  )
}

createRoot(document.getElementById('terminal')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

