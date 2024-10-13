import type { CommandRegistry } from './command'
import type { VirtualFileSystem } from './fs'
import type { InputStream, OutputStream } from './io'
import { ShellState } from './shellState'

export interface CompletionResult {
  newLine: string
  completions: string[]
  selectedIndex: number
}

export type CompletionFunction = (line: string, direction: number) => CompletionResult

export class Shell {
  private state: ShellState = new ShellState()
  private prompt: string = '$ '
  private currentCompletions: string[] = []
  private selectedCompletionIndex: number = -1

  constructor(
    private stdin: InputStream,
    private stdout: OutputStream,
    private commandRegistry: CommandRegistry,
    private fs: VirtualFileSystem,
  ) {
    this.stdin.onData(this.handleInput.bind(this))
  }

  handleInput(input: string): void {
    const [commandName, ...args] = input.trim().split(/\s+/)

    if (commandName === 'clear') {
      this.stdout.write('\x1B[2J\x1B[0f')
      return
    }

    if (commandName === '')
      return

    const command = this.commandRegistry.getCommand(commandName)
    if (command) {
      command.execute({
        args,
        shellState: this.state,
        fs: this.fs,
        stdin: this.stdin,
        stdout: this.stdout,
      })
    }
    else {
      this.stdout.write(`Command not found: ${commandName}\n`)
    }
    this.state.addToHistory(commandName)
    this.resetCompletions()
  }

  complete(line: string, direction: number = 0): CompletionResult {
    const [partialCommand, ...args] = line.split(/\s+/)

    let newLine = line
    let completions: string[] = []

    if (args.length === 0) {
      completions = this.commandRegistry.getCommandNames().filter(cmd => cmd.startsWith(partialCommand))
      if (completions.length === 1) {
        newLine = `${completions[0]} `
        completions = []
      }
    }
    else {
      const command = this.commandRegistry.getCommand(partialCommand)
      if (command && command.complete) {
        completions = command.complete({ stdin: this.stdin, stdout: this.stdout, args, shellState: this.state, fs: this.fs })
        if (completions.length === 1) {
          const preservedPart = [partialCommand, ...args.slice(0, -1)].join(' ')
          newLine = `${preservedPart} ${completions[0]}`.trim()
          completions = []
        }
        else if (completions.length > 1) {
          const commonPrefix = this.findCommonPrefix(completions)
          if (commonPrefix.length > args[args.length - 1].length) {
            const preservedPart = [partialCommand, ...args.slice(0, -1)].join(' ')
            newLine = `${preservedPart} ${commonPrefix}`.trim()
          }
        }
      }
    }

    if (completions.length > 0 && !this.arraysEqual(completions, this.currentCompletions)) {
      this.currentCompletions = completions
      this.selectedCompletionIndex = -1
    }

    if (direction !== 0 && this.currentCompletions.length > 0) {
      this.selectedCompletionIndex += direction
      if (this.selectedCompletionIndex < 0)
        this.selectedCompletionIndex = this.currentCompletions.length - 1
      if (this.selectedCompletionIndex >= this.currentCompletions.length)
        this.selectedCompletionIndex = 0
      newLine = this.applyCompletion(line, this.currentCompletions[this.selectedCompletionIndex])
    }

    return {
      newLine,
      completions: this.currentCompletions,
      selectedIndex: this.selectedCompletionIndex,
    }
  }

  private applyCompletion(line: string, completion: string): string {
    const [command, ...args] = line.split(/\s+/)
    const newArgs = [...args.slice(0, -1), completion]
    return `${command} ${newArgs.join(' ')}`.trim()
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index])
  }

  private findCommonPrefix(strings: string[]): string {
    if (strings.length === 0)
      return ''
    if (strings.length === 1)
      return strings[0]
    let i = 0
    while (strings[0][i] && strings.every(s => s[i] === strings[0][i]))
      i++
    return strings[0].slice(0, i)
  }

  private resetCompletions(): void {
    this.currentCompletions = []
    this.selectedCompletionIndex = -1
  }

  getPrompt(): string {
    // You can also add ANSI escape sequences to color the prompt if desired
    return `\x1B[32m${this.prompt}\x1B[0m`
  }

  setPrompt(newPrompt: string): void {
    this.prompt = newPrompt
  }

  isValidCommand(input: string): string {
    const [commandName] = input.trim().split(/\s+/)
    const isValid = this.commandRegistry.getCommand(commandName) !== undefined

    if (isValid) {
      // Return the command name wrapped in ANSI escape sequences for blue color
      return `\x1B[34m${commandName}\x1B[0m${input.slice(commandName.length)}`
    }
    else {
      // Return the original input without color coding
      return input
    }
  }
}
