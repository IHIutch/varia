import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { presetVaria } from '../src/preset.js'

describe('utility ordering', () => {
  it.each(['slot', 'compound'] as const)('sorts responsive and padding rules for %s variants', async (kind) => {
    const utilities = 'lg:opacity-75 md:opacity-50 px-2 p-4'
    const component = kind === 'slot'
      ? defineComponent('probe', { slots: { body: 'block' }, variants: { active: { body: utilities } } })
      : defineComponent('probe', { variants: { active: 'block', square: 'block' }, compoundVariants: [{ when: { active: true, square: true }, class: utilities }] })
    const uno = await createGenerator({ presets: [presetWind4(), presetVaria({ components: [component], manifest: false })] })
    const { css } = await uno.generate('probe-active probe-square probe__body')
    expect(css.indexOf('@media (min-width: 48rem)')).toBeLessThan(css.indexOf('@media (min-width: 64rem)'))
    expect(css.indexOf('{padding:')).toBeLessThan(css.indexOf('{padding-inline:'))
  })
})

describe('component override precedence', () => {
  it.each([false, true])('keeps root, descendant, and compound overrides in the shortcut layer, layered=%s', async (outputToCssLayers) => {
    const component = defineComponent('probe', {
      slots: { root: 'opacity-100', body: 'opacity-100' },
      variants: { active: { root: 'opacity-50', body: 'opacity-50' }, square: 'block' },
      compoundVariants: [{ when: { square: true }, class: 'opacity-75' }],
    })
    const uno = await createGenerator({
      presets: [presetWind4(), presetVaria({ components: [component], manifest: false })],
      outputToCssLayers,
      shortcutsLayer: 'components',
      layers: { components: -10 },
    })
    const result = await uno.generate('probe probe-active probe-square probe__body')
    const css = result.getLayer('components')!
    // Repeating a class adds specificity without requiring a base/root class.
    expect(css).toContain('.probe-active.probe-active{opacity:50%;}')
    expect(css).toContain('.probe-active .probe__body{opacity:50%;}')
    expect(css).toContain('.probe-square.probe-square{opacity:75%;}')
    expect(css).toContain('opacity:100%;')
    expect(result.getLayer('preflights') ?? '').not.toContain('.probe-')
    if (outputToCssLayers)
      expect(css).toContain('@layer components{')
  })
})

describe('slot payload validation', () => {
  it('rejects a nested slot payload before CSS generation', () => {
    expect(() => defineComponent('probe', {
      slots: { header: 'block' },
      variants: { accent: { header: { header: 'bg-red-500' } } },
    })).toThrow(/accent.*probe.*header.*string/)
  })

  it.each([{ header: '' }, { header: '   ' }, { header: [] }])('rejects an empty slot expansion %j', (accent) => {
    expect(() => defineComponent('probe', { slots: { header: 'block' }, variants: { accent } })).toThrow(/Empty expansion/)
  })

  it('rejects an empty named slot value', () => {
    expect(() => defineComponent('probe', { slots: { header: 'block' }, variants: { tone: { solid: {} } } })).toThrow(/solid.*probe.*empty/)
  })
})

describe('multiple preset manifests', () => {
  it('aggregates shared paths, isolates separate paths, and removes stale registrations on reload', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'varia-multi-'))
    try {
      const path = join(dir, 'manifest.d.ts')
      const separatePath = join(dir, 'separate.d.ts')
      const button = defineComponent('btn', { base: 'block' })
      const card = defineComponent('card', { base: 'block' })
      const alert = defineComponent('alert', { base: 'block' })
      const btnPreset = presetVaria({ components: [button], manifest: { path } })
      const cardPreset = presetVaria({ components: [card], manifest: { path } })
      const alertPreset = presetVaria({ components: [alert], manifest: { path: separatePath } })
      const uno = await createGenerator({ presets: [presetWind4(), btnPreset, cardPreset, alertPreset] })
      expect(readFileSync(path, 'utf-8')).toContain('\'btn\'')
      expect(readFileSync(path, 'utf-8')).toContain('\'card\'')
      expect(readFileSync(path, 'utf-8')).not.toContain('\'alert\'')
      expect(readFileSync(separatePath, 'utf-8')).toContain('\'alert\'')
      await uno.setConfig({ presets: [presetWind4(), btnPreset] })
      expect(readFileSync(path, 'utf-8')).toContain('\'btn\'')
      expect(readFileSync(path, 'utf-8')).not.toContain('\'card\'')
      // A new generator must not inherit another generator's registrations.
      await createGenerator({ presets: [presetWind4(), cardPreset] })
      expect(readFileSync(path, 'utf-8')).not.toContain('\'btn\'')
      expect(readFileSync(path, 'utf-8')).toContain('\'card\'')
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
