export class Terminal {
  private element: HTMLElement;
  private output: string[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
    this.render();
  }

  write(text: string): void {

    if (text === '\b \b') {
      // Handle backspace
      if (this.output.length > 0) {
        let lastLine = this.output[this.output.length - 1];
        if (lastLine && (lastLine?.length ?? 0) > 0) {
          this.output[this.output.length - 1] = lastLine.slice(0, -1);
        } else if (this.output.length > 1) {
          // If the last line is empty, remove it and trim the previous line
          this.output.pop();
          this.output[this.output.length - 1] = (this.output[this.output.length - 1] ?? "").slice(0, -1);
        }
      }
    } else {
      const lines = text.split('\n');
      if (lines.length === 1) {
        if (this.output.length === 0) {
          this.output.push(lines[0] ?? "");
        } else {
          this.output[this.output.length - 1] += lines[0] ?? "";
        }
      } else {
        if (this.output.length === 0) {
          this.output = lines;
        } else {
          this.output[this.output.length - 1] += lines[0] ?? "";
          this.output.push(...lines.slice(1));
        }
      }
    }
    this.render();
  }

  clear(): void {
    this.output = [];
    this.render();
  }

  private render(): void {
    console.log(this.output)
    this.element.innerHTML = this.output.join('<br>') + '<span class="cursor">█</span>';
    this.element.scrollTop = this.element.scrollHeight;
  }
}

