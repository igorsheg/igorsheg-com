import type { InputStream, OutputStream } from './io'

export class Shell {
  constructor(
    private stdin: InputStream,
    private stdout: OutputStream,
    private stderr: OutputStream,
  ) { }

  run(): void {
    this.stdin.onData(this.handleInput.bind(this))
  }

  private handleInput(input: string): void {
    const command = input.trim()
    if (command === 'clear') {
      this.stdout.write('\x1B[2J\x1B[0f')
    }
    else if (command !== '') {
      this.stdout.write(`Executed: ${command}\n`)
    }
  }
}
