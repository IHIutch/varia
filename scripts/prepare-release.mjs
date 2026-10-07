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
  const packageRoot = join(root, 'packages/varia')
  execFileSync('npm', ['pack', '--pack-destination', temporary], { cwd: packageRoot, stdio: 'inherit' })
  const { version } = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'))
  const filename = `variacss-${version}.tgz`
  const archive = join(temporary, filename)
  const env = { VARIA_RELEASE_ARCHIVE: archive }
  // The unit suite includes the clean-install smoke test of this archive.
  for (const command of ['test', 'typecheck', 'lint', 'example:build'])
    run([command], env)
  await mkdir(output, { recursive: true })
  await copyFile(archive, join(output, filename))
  console.log(`Verified release archive: ${join(output, filename)}`)
}
finally {
  await rm(temporary, { recursive: true, force: true })
}
