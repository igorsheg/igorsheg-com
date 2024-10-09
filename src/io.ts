interface Stream {
  read(): string | null;
  write(data: string): void;
}

export class InputStream implements Stream {
  private buffer: string = '';

  read(): string | null {
    if (this.buffer.length === 0) return null;
    const char = this.buffer[0];
    this.buffer = this.buffer.slice(1);
    if (char) {
      return char;
    }
    return null
  }

  write(data: string): void {
    this.buffer += data;
  }
}

export class OutputStream implements Stream {
  private callbacks: ((data: string) => void)[] = [];

  read(): string | null {
    return null;
  }

  write(data: string): void {
    this.callbacks.forEach(callback => callback(data));
  }

  onWrite(callback: (data: string) => void): void {
    this.callbacks.push(callback);
  }
}
