import { readdir, stat } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../dist', import.meta.url))
const htmlBudget = 30 * 1024

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory())
      files.push(...await filesIn(path))
    else
      files.push(path)
  }

  return files
}

async function main() {
  const files = await filesIn(root)
  const oversizedPages = []

  for (const file of files) {
    if (file.endsWith('.html')) {
      const { size } = await stat(file)
      if (size > htmlBudget)
        oversizedPages.push(`${relative(root, file)} (${size} bytes)`)
    }
  }

  const clientScripts = files
    .filter(file => file.startsWith(resolve(root, '_astro')) && file.endsWith('.js'))
    .map(file => relative(root, file))

  if (oversizedPages.length > 0 || clientScripts.length > 0) {
    if (oversizedPages.length > 0)
      console.error(`HTML budget exceeded:\n${oversizedPages.join('\n')}`)
    if (clientScripts.length > 0)
      console.error(`Client JavaScript emitted:\n${clientScripts.join('\n')}`)
    process.exitCode = 1
    return
  }

  console.log('Static budgets passed: HTML <= 30 KiB and no client JavaScript bundles.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
