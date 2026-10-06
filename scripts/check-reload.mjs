import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { setTimeout } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const recipe = new URL('../recipes/nav.config.ts', import.meta.url)
const original = await readFile(recipe, 'utf8')
const edited = original.replace('[&&]:text-gray-900 [&&]:hover:text-gray-900', '[&&]:text-red-600 [&&]:hover:text-red-600')
if (edited === original)
  throw new Error('The nav fixture no longer contains the expected active color.')
const port = 4187
const origin = `http://127.0.0.1:${port}`
const asset = existsSync(new URL('../packages/varia/src/unocss.ts', import.meta.url)) ? '__uno.css' : 'styles.css'
const server = spawn('pnpm', ['example:dev', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
let logs = ''
for (const stream of [server.stdout, server.stderr])
  stream.on('data', chunk => logs = `${logs}${chunk}`.slice(-4000))

async function activeRules() {
  const response = await fetch(`${origin}/${asset}?direct`)
  if (!response.ok)
    throw new Error(`Stylesheet returned ${response.status}.`)
  return (await response.text()).match(/\.nav__link-active[^{}]*\{[^{}]*\}/g)?.join('\n') ?? ''
}

async function waitForColor(color) {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    if (server.exitCode !== null)
      throw new Error(`Dev server exited:\n${logs}`)
    try {
      if (new RegExp(`var\\(--colors?-${color}\\)`).test(await activeRules()))
        return
    }
    catch {
      // Startup and automatic restarts temporarily close the HTTP connection.
    }
    await setTimeout(100)
  }
  throw new Error(`Active nav color did not become ${color}.\n${logs}`)
}

try {
  await waitForColor('gray-900')
  await writeFile(recipe, edited)
  await waitForColor('red-600')
  await writeFile(recipe, original)
  await waitForColor('gray-900')
  console.log('Recipe edits and restoration update the served CSS without a manual restart.')
}
finally {
  if (await readFile(recipe, 'utf8') === edited)
    await writeFile(recipe, original)
  if (server.pid) {
    try {
      process.kill(-server.pid, 'SIGTERM')
    }
    catch {
      server.kill('SIGTERM')
    }
  }
}
