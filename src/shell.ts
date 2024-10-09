import { InputStream, OutputStream } from "./io";

export class Shell {
  private stdin: InputStream;
  private stdout: OutputStream;
  private stderr: OutputStream;
  private currentInput: string = '';
  private history: string[] = [];
  private historyIndex: number = -1;

  constructor(stdout: OutputStream, stderr: OutputStream) {
    this.stdin = new InputStream();
    this.stdout = stdout;
    this.stderr = stderr;
    this.prompt();
  }

  handleInput(key: string): void {
    switch (key) {
      case 'Enter':
        this.executeCommand();
        break;
      case 'Backspace':
        if (this.currentInput.length > 0) {
          this.currentInput = this.currentInput.slice(0, -1);
          this.stdout.write('\b \b');
        }
        break;
      case 'ArrowUp':
        this.navigateHistory(-1);
        break;
      case 'ArrowDown':
        this.navigateHistory(1);
        break;
      default:
        if (key.length === 1) {
          this.currentInput += key;
          this.stdin.write(key);
          this.stdout.write(key);
        }
    }
  }

  private executeCommand(): void {
    this.stdout.write('\n');
    if (this.currentInput.trim() !== '') {
      this.history.push(this.currentInput);
      this.historyIndex = this.history.length;

      if (this.currentInput.trim() === 'help') {
        this.stdout.write('<span class="command-output">Help command placeholder. More commands will be implemented in the future.</span>\n');
      } else {
        this.stderr.write(`<span class="error-message">Command not found: ${this.currentInput}</span>\n`);
      }
    }
    this.currentInput = '';
    this.stdout.write('\n');
    this.prompt();
  }

  private prompt(): void {
    this.stdout.write('$ ');
  }

  private navigateHistory(direction: number): void {
    if (this.history.length === 0) return;

    this.historyIndex += direction;
    if (this.historyIndex < 0) this.historyIndex = 0;
    if (this.historyIndex >= this.history.length) this.historyIndex = this.history.length - 1;

    const newInput = this.history[this.historyIndex];
    this.stdout.write('\r$ ' + ' '.repeat(this.currentInput.length) + '\r$ ' + newInput);

    if (newInput) {
      this.currentInput = newInput;
    }
  }
}

