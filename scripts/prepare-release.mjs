import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const output = join(root, '.release')
const temporary = await mkdtemp(join(tmpdir(), 'varia-release-'))
const run = (args, env = {}) => execFileSync('pnpm', args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } })

try {
  // Never leave an old verified archive behind after a failed preparation.
  await rm(output, { recursive: true, force: true })
  for (const command of ['test', 'typecheck', 'lint', 'example:build', 'test:editor'])
    run([command])
  // Stored image references are Chromium on macOS; Linux still runs the
  // real-browser computed-style and reload assertions in the consumer gate.
  if (process.platform === 'darwin')
    run(['test:visual'])
  const packageRoot = join(root, 'packages/varia')
  execFileSync('npm', ['pack', '--pack-destination', temporary], { cwd: packageRoot, stdio: 'inherit' })
  const { version } = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'))
  const filename = `varia-${version}.tgz`
  const archive = join(temporary, filename)
  const env = { VARIA_RELEASE_ARCHIVE: archive }
  run(['--filter', 'varia', 'exec', 'vitest', 'run', 'test/packaging.test.ts'], env)
  run(['--filter', 'varia', 'exec', 'vitest', 'run', '--config', 'vitest.reload.config.ts'], env)
  await mkdir(output, { recursive: true })
  await copyFile(archive, join(output, filename))
  console.log(`Verified release archive: ${join(output, filename)}`)
}
finally {
  await rm(temporary, { recursive: true, force: true })
}
