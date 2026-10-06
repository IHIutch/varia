import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { defineComponent as defineBundledComponent } from 'varia'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { presetVaria } from '../src/preset.js'

describe('on-demand component CSS', () => {
  it('emits no styles or dependencies for unused slot and compound variants', async () => {
    const card = defineComponent('card', {
      slots: { root: 'block', body: 'block' },
      variants: { active: { body: 'bg-blue-600 animate-spin' }, square: 'block' },
      compoundVariants: [{ when: { square: true }, class: 'bg-red-600 animate-pulse' }],
    })
    const uno = await createGenerator({ presets: [presetWind4(), presetVaria({ components: [card], manifest: false })] })
    const { css } = await uno.generate('flex')
    expect(css).not.toMatch(/\.card|--colors-(?:blue|red)-600|@keyframes (?:spin|pulse)/)
    expect(css).toContain('.flex{display:flex;}')
  })

  it('can reuse a definition in multiple presets without modifying its shortcuts', async () => {
    const button = defineComponent('btn', {
      variants: { active: 'block' },
      compoundVariants: [{ when: { active: true }, class: 'opacity-50' }],
    })
    const original = button.shortcuts.map(shortcut => [...shortcut])
    const presets = [
      presetVaria({ components: [button], manifest: false }),
      presetVaria({ components: [button], manifest: false }),
    ]
    expect(button.shortcuts).toEqual(original)
    for (const preset of presets) {
      const uno = await createGenerator({ presets: [presetWind4(), preset] })
      const { css } = await uno.generate('btn-active')
      expect(css.match(/\.btn-active\.btn-active\{opacity:50%;\}/g)).toHaveLength(1)
    }
  })

  it('keeps compound overrides after slot overrides with equal specificity', async () => {
    const component = defineComponent('probe', {
      slots: { root: 'opacity-100' },
      variants: { active: 'block', accent: { root: 'opacity-50' } },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
    })
    const uno = await createGenerator({ presets: [presetWind4(), presetVaria({ components: [component], manifest: false })] })
    const { css } = await uno.generate('probe probe-active probe-accent')
    const slot = css.indexOf('.probe-accent.probe-accent{opacity:50%;}')
    const compound = css.indexOf('.probe-active.probe-accent{opacity:75%;}')
    expect(slot).toBeGreaterThanOrEqual(0)
    expect(compound).toBeGreaterThan(slot)
  })

  it('keeps shortcut layers independent when a preset is shared by generators', async () => {
    const component = defineComponent('probe', { slots: { root: 'block' }, variants: { active: { root: 'opacity-50' } } })
    const preset = presetVaria({ components: [component], manifest: false })
    const first = await createGenerator({ presets: [presetWind4(), preset], shortcutsLayer: 'first-components' })
    await first.generate('probe-active')
    const second = await createGenerator({ presets: [presetWind4(), preset], shortcutsLayer: 'second-components' })
    expect((await second.generate('probe-active')).getLayer('second-components')).toContain('opacity:50%;')
    expect((await first.generate('probe-active')).getLayer('first-components')).toContain('opacity:50%;')
  })

  it('recognizes on-demand styles created by a bundled copy of the library', async () => {
    const component = defineBundledComponent('bundled', {
      slots: { root: 'block' },
      variants: { active: { root: 'opacity-50' } },
    })
    const uno = await createGenerator({ presets: [presetWind4(), presetVaria({ components: [component], manifest: false })] })
    expect((await uno.generate('flex')).css).not.toContain('.bundled-active')
  })

  it('preserves UnoCSS negative modifiers on ordinary variant shortcuts', async () => {
    const component = defineComponent('probe', {
      slots: { root: 'block' },
      variants: { gap: 'm-2', active: { root: 'opacity-50' } },
    })
    const uno = await createGenerator({ presets: [presetWind4(), presetVaria({ components: [component], manifest: false })] })
    expect((await uno.generate('-probe-gap')).css).toContain('.-probe-gap{margin:calc(var(--spacing) * -2);}')
  })
})
