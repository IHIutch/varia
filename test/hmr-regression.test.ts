// HMR regression guard
//
// In dev (Vite + @unocss/vite + presetVaria), an edit to a component config
// flows through as: file change → Vite HMR → UnoCSS re-resolves presets →
// presetVaria re-runs → manifest re-emits.
//
// We don't test the Vite/UnoCSS file-watching layer (UnoCSS's own suite
// covers it). Instead we test the chain that varia OWNS: when UnoCSS
// re-resolves presetVaria with different component data, the manifest on
// disk reflects the new shape. That's the regression-prone part.

import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { presetVaria } from '../src/preset.js'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'varia-hmr-regression-'))
})

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true })
})

describe('HMR regression: config change flows through real UnoCSS to manifest', () => {
  it('first build produces manifest with initial component shape', async () => {
    const path = join(dir, 'manifest.d.ts')
    const initial = defineComponent('btn', {
      base: 'inline-block',
      variants: { c: { primary: 'bg-blue-600' } },
    })

    await createGenerator({
      presets: [presetWind4(), presetVaria({ components: [initial], manifest: { path } })],
    })

    const m = readFileSync(path, 'utf-8')
    expect(m).toContain("'btn'")
    expect(m).toContain("'btn-c-primary'")
    expect(m).not.toContain("'card'")
  })

  it('subsequent build with changed config (simulating an HMR re-resolve) updates the manifest', async () => {
    const path = join(dir, 'manifest.d.ts')

    // First build
    const before = defineComponent('btn', { base: 'inline-block' })
    await createGenerator({
      presets: [presetWind4(), presetVaria({ components: [before], manifest: { path } })],
    })
    expect(readFileSync(path, 'utf-8')).not.toContain("'card'")

    // Mutated config: btn changes, card added — what UnoCSS sees after Vite picks up
    // a config-file edit and re-resolves the preset graph.
    const after = defineComponent('btn', { base: 'block' })
    const card = defineComponent('card', { base: 'p-4 rounded' })
    await createGenerator({
      presets: [
        presetWind4(),
        presetVaria({ components: [after, card], manifest: { path } }),
      ],
    })

    const m = readFileSync(path, 'utf-8')
    expect(m).toContain("'btn'")
    expect(m).toContain("'card'")
  })

  it('shrinking the config (component removed) shrinks the manifest', async () => {
    const path = join(dir, 'manifest.d.ts')

    const btn = defineComponent('btn', { base: 'inline-block' })
    const card = defineComponent('card', { base: 'p-4' })
    await createGenerator({
      presets: [
        presetWind4(),
        presetVaria({ components: [btn, card], manifest: { path } }),
      ],
    })
    expect(readFileSync(path, 'utf-8')).toContain("'card'")

    await createGenerator({
      presets: [presetWind4(), presetVaria({ components: [btn], manifest: { path } })],
    })

    expect(readFileSync(path, 'utf-8')).not.toContain("'card'")
  })
})
