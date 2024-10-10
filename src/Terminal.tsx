import type { KeyboardEvent } from 'react'
import type { CompletionFunction, OutputStream } from './lib'
import { useEffect, useRef, useState } from 'react'

interface TerminalProps {
  stdout: OutputStream
  onInputCallback: (input: string) => void
  completionFunction: CompletionFunction
  getPromptCallback: () => string
  output: string[]
}

export function Terminal({
  stdout,
  onInputCallback,
  completionFunction,
  getPromptCallback,
  output,
}: TerminalProps) {
  const [buffer, setBuffer] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [completions, setCompletions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)

  const updatePrompt = () => {
    setCurrentPrompt(getPromptCallback())
  }

  const clearOutput = () => {
    setBuffer('')
  }

  const setupStdoutListener = () => {
    stdout.onWrite((data) => {
      if (data === '\x1B[2J\x1B[0f') {
        clearOutput()
      }
    })
  }

  useEffect(() => {
    updatePrompt()
    setupStdoutListener()
  }, [])

  useEffect(() => {
    setCurrentPrompt(getPromptCallback())
  }, [getPromptCallback])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output, buffer, completions])

  const handleTabCompletion = (direction: number) => {
    const { newLine, completions: newCompletions, selectedIndex: newIndex } = completionFunction(buffer, direction)
    setBuffer(newLine)
    setCompletions(newCompletions)
    setSelectedIndex(newIndex)
  }

  const sendInput = () => {
    onInputCallback(`${buffer}\n`)
    setBuffer('')
    setCompletions([])
    setSelectedIndex(-1)
    setCurrentPrompt(getPromptCallback())
  }

  const backspace = () => {
    if (buffer.length > 0) {
      setBuffer(prev => prev.slice(0, -1))
    }
  }

  const appendToInput = (char: string) => {
    setBuffer(prev => prev + char)
  }

  const handleCtrlC = () => {
    setBuffer(prev => `${prev}^C`)
    sendInput()
  }

  const focus = () => {
    if (terminalRef.current) {
      terminalRef.current.focus()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    switch (event.key) {
      case 'Enter':
        sendInput()
        break
      case 'Backspace':
        backspace()
        break
      case 'Tab':
        handleTabCompletion(0)
        break
      case 'ArrowUp':
        handleTabCompletion(-1)
        break
      case 'ArrowDown':
        handleTabCompletion(1)
        break
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          appendToInput(event.key)
        }
        else if (event.ctrlKey && event.key === 'c') {
          handleCtrlC()
        }
    }
  }

  return (
    <div
      ref={terminalRef}
      className="terminal"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onClick={focus}
    >
      <div className="terminal-output">
        {output.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      <div className="terminal-input">
        <span className="prompt">{currentPrompt}</span>
        <span className="buffer">{buffer}</span>
        <span className="cursor">█</span>
      </div>
      {completions.length > 0 && (
        <div className="completions">
          {completions.map((completion, index) => (
            <div
              key={index}
              className={index === selectedIndex ? 'selected' : ''}
            >
              {completion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

