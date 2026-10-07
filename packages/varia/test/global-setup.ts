import type { TestProject } from 'vitest/node'
import { execFileSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

declare module 'vitest' {
  export interface ProvidedContext {
    archive: string
  }
}

// Pack before any test file runs: `prepack` rebuilds `dist`, which other files read.
export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const dir = await mkdtemp(join(tmpdir(), 'varia-pack-'))
  const archive = process.env.VARIA_RELEASE_ARCHIVE ?? join(dir, JSON.parse(execFileSync('npm', ['pack', '--json', '--foreground-scripts=false', '--pack-destination', dir], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    encoding: 'utf8',
  }))[0].filename)
  project.provide('archive', archive)
  return () => rm(dir, { recursive: true, force: true })
}
