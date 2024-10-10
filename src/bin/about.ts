import type { InMemoryFileSystem, InputStream, OutputStream } from '../lib'
import type { Command } from './types'

export class AboutCommand implements Command {
  name = 'about'
  description = 'Display information about the author'

  execute(_args: string[], _fs: InMemoryFileSystem, _stdin: InputStream, stdout: OutputStream): void {
    const aboutText = `
╭────────────────────────────────────────────────────────────╮
│░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒│
╎░▒▓█▓▒░▒▓█▓▒░▒▓█ 1337 r34dMe s3c7i0n ▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒╎
┊░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒┊
┊  ___ ___  _ __ | |_ __ _  ___| |_  tw33t @igorsheg         ┊ 
┊ / __/ _ \\| '_ \\| __/ _\` |/ __| __| w3b   igorsheg.com   ┊
┊| (_| (_) | | | | || (_| | (__| |_  m4iL  igorsheg@gmail.com┊
┊ \\___\\___/|_| |_|\\__\\__,_|\\___|\__|                    ┊
┊░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒┊
┊ ................. pronounce it: YAGOSH ................... ┊
╰────────────────────────────────────────────────────────────╯
`
    stdout.write(aboutText)
  }
}
