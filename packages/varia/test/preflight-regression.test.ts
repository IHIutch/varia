import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { emitResolvedCSS, resolveUtilities } from '../src/internal/resolve-utilities.js'
import { presetVaria } from '../src/preset.js'

describe('preflight selector preservation', () => {
  it.each([
    ['hover:focus:opacity-50', '.target:focus:hover{opacity:50%;}'],
    ['data-[state=open]:opacity-50', '.target[data-state=open]{opacity:50%;}'],
    ['group-hover:opacity-50', '.group:hover .target{opacity:50%;}'],
    ['dark:opacity-50', '.dark .target{opacity:50%;}'],
    ['md:opacity-50', '@media (min-width: 48rem){.target{opacity:50%;}}'],
    ['before:opacity-50', '.target::before{opacity:50%;}'],
  ])('preserves %s', async (utility, expected) => {
    const uno = await createGenerator({ presets: [presetWind4()] })
    const css = emitResolvedCSS('.target', await resolveUtilities(utility, uno))
    // Compare the whole output so an extra unconditional rule also fails.
    expect(css).toBe(expected)
  })

  it('preserves nested at-rules', async () => {
    const uno = await createGenerator({ presets: [presetWind4()] })
    const css = emitResolvedCSS('.target', await resolveUtilities('md:supports-[display:grid]:opacity-50', uno))
    expect(css).toBe('@supports (display:grid){@media (min-width: 48rem){.target{opacity:50%;}}}')
  })
})

describe('preflight CSS dependencies', () => {
  it.each(['compound', 'slot'] as const)('emits palette variables and keyframes for %s rules', async (kind) => {
    const component = kind === 'compound'
      ? defineComponent('probe', {
          base: 'block',
          variants: { active: 'block', square: 'aspect-square' },
          compoundVariants: [{ when: { active: true, square: true }, class: 'bg-blue-600 animate-spin' }],
        })
      : defineComponent('probe', {
          slots: { root: 'block', body: 'block' },
          variants: { active: { body: 'bg-blue-600 animate-spin' } },
        })
    const uno = await createGenerator({ presets: [presetWind4(), presetVaria({ components: [component], manifest: false })] })
    // The source references only Varia classes, never their underlying utilities.
    for (let i = 0; i < 2; i++) {
      const { css } = await uno.generate('probe probe-active probe-square probe__body')
      expect(css).toContain('var(--colors-blue-600)')
      expect(css).toMatch(/--colors-blue-600\s*:/)
      expect(css).toContain('animation:spin')
      expect(css).toContain('@keyframes spin')
      expect(css).not.toMatch(/\.bg-blue-600\s*\{/)
      expect(css).not.toMatch(/\.animate-spin\s*\{/)
    }
  })
})

describe('all generated class names are unique', () => {
  it('rejects a slot-keyed variant colliding with another component', () => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'font-bold' },
      variants: { accent: { title: 'opacity-50' } },
    })
    const conflicting = defineComponent('card-accent', { base: 'opacity-100' })
    expect(() => presetVaria({ components: [card, conflicting], manifest: false })).toThrow(/Duplicate.*card-accent/)
  })

  it('rejects colliding slot-keyed variants within a component', () => {
    const card = defineComponent('card', {
      slots: { root: 'block' },
      variants: {
        'accent-dark': { root: 'opacity-50' },
        'accent': { dark: { root: 'opacity-100' } },
      },
    })
    expect(() => presetVaria({ components: [card], manifest: false })).toThrow(/Duplicate.*card-accent-dark/)
  })
})
