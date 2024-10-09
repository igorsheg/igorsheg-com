import type { InputStream, OutputStream } from './io'

export class Shell {
  private stdin: InputStream
  private stdout: OutputStream
  private stderr: OutputStream

  constructor(stdin: InputStream, stdout: OutputStream, stderr: OutputStream) {
    this.stdin = stdin
    this.stdout = stdout
    this.stderr = stderr
  }

  run(): void {
    this.readAndExecute()
  }

  private readAndExecute(): void {
    let input = ''
    let char = this.stdin.read()
    while (char !== null) {
      if (char === '\n') {
        this.executeCommand(input)
        input = ''
      }
      else {
        input += char
      }
      char = this.stdin.read()
    }
    // Continue reading in the next event loop iteration
    setTimeout(() => this.readAndExecute(), 0)
  }

  private executeCommand(command: string): void {
    if (command.trim() === 'clear') {
      this.stdout.write('\x1B[2J\x1B[0f')
    }
    else if (command.trim() !== '') {
      this.stdout.write(`Executed: ${command}\n`)
    }
  }
}

