import type { Command, CommandArgs } from './types'
import { ANSI } from '../lib'

class Starfield {
  private stars: { x: number, y: number }[] = []
  private width: number
  private height: number

  constructor(width: number, height: number, starCount: number) {
    this.width = width
    this.height = height
    for (let i = 0; i < starCount; i++) {
      this.stars.push(this.randomStar())
    }
  }

  private randomStar() {
    return { x: Math.floor(Math.random() * this.width), y: Math.floor(Math.random() * this.height) }
  }

  move() {
    this.stars = this.stars.map((star) => {
      star.x -= 1
      if (star.x < 0) {
        return { x: this.width - 1, y: Math.floor(Math.random() * this.height) }
      }
      return star
    })
  }

  render() {
    const field = new Array(this.height).fill(0).map(() => new Array(this.width).fill(' '))
    this.stars.forEach((star) => {
      field[star.y][star.x] = '.'
    })
    return field.map(row => row.join('')).join('\n')
  }
}

const spaceship = [
  '    /\\',
  ' __/ \\__',
  '/  \\ /  \\',
  '\\__/ \\__/',
  '    \\/',
]

export class AnimateCommand implements Command {
  name = 'animate'
  description = 'Display a cool space animation'

  async execute({ stdout }: CommandArgs): Promise<void> {
    const width = 60
    const height = 20
    const starfield = new Starfield(width, height, 50)
    let frame = 0

    stdout.write('Starting space animation... (Press Ctrl+C to stop)\n')

    const intervalId = setInterval(() => {
      stdout.write(ANSI.CLEAR)

      const field = starfield.render().split('\n')

      const shipY = Math.floor(height / 2) - Math.floor(spaceship.length / 2)
      for (let i = 0; i < spaceship.length; i++) {
        const y = shipY + i
        if (y >= 0 && y < height) {
          field[y] = field[y].slice(0, 10) + spaceship[i] + field[y].slice(10 + spaceship[i].length)
        }
      }

      if (frame % 10 === 0) {
        const warpY = Math.floor(Math.random() * height)
        field[warpY] = '-'.repeat(width)
      }

      stdout.write(field.join('\n'))
      starfield.move()
      frame++
    }, 60)

    setTimeout(() => {
      clearInterval(intervalId)
      stdout.write(ANSI.CLEAR)
      stdout.write('Space journey completed!\n')
    }, 6000)
  }
}