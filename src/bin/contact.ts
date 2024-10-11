import type { Command, CommandArgs } from './types'
import { fuzzyMatch, scoreMatch } from '../utils'

const CONTACT_URLS = {
  github: 'https://github.com/igorsheg',
  x: 'https://x.com/igor_sheg',
  mail: 'mailto:igorsheg@gmail.com',
}

export class ContactCommand implements Command {
  name = 'contact'
  description = 'Open contact information in a new tab'

  execute({ args, stdout }: CommandArgs): void {
    if (args.length !== 1) {
      stdout.write('Usage: contact <method>\n')
      stdout.write('Available methods: github, x, mail\n')
      return
    }

    const method = args[0].toLowerCase()
    const url = CONTACT_URLS[method as keyof typeof CONTACT_URLS]

    if (url) {
      window.open(url, '_blank')
      stdout.write(`Opening ${method} contact in a new tab...\n`)
    }
    else {
      stdout.write(`Invalid contact method: ${method}\n`)
      stdout.write('Available methods: web, git, tweet, mail\n')
    }
  }

  complete({ args }: CommandArgs): string[] {
    const partialMethod = args[args.length - 1] || ''
    const availableMethods = Object.keys(CONTACT_URLS)

    return availableMethods
      .filter(method => fuzzyMatch(partialMethod.toLowerCase(), method.toLowerCase()))
      .sort((a, b) => scoreMatch(partialMethod, b) - scoreMatch(partialMethod, a))
  }
}