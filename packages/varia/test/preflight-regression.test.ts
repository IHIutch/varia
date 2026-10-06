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
    for (const input of ['probe probe-active probe-square probe__body', 'probe-active probe__body flex']) {
      const { css } = await uno.generate(input)
      expect(css).toContain('var(--colors-blue-600)')
      expect(css).toMatch(/--colors-blue-600\s*:/)
      expect(css).toContain('animation:spin')
      expect(css).toContain('@keyframes spin')
      expect(css).not.toMatch(/\.bg-blue-600\s*\{/)
      expect(css).not.toMatch(/\.animate-spin\s*\{/)
    }
  })

  it.each(['compound', 'slot'] as const)('uses custom theme values in %s rules', async (kind) => {
    const component = themedComponent('badge', kind, 'bg-brand p-3')
    const uno = await createGenerator({
      presets: [presetWind4(), presetVaria({ components: [component], manifest: false })],
      theme: { colors: { brand: '#123456' }, spacing: { DEFAULT: '0.375rem' } },
    })
    const { css } = await uno.generate('badge badge-active badge__body')
    expect(css).toContain(`${activeSelector('badge', kind)}{background-color:color-mix(in srgb, var(--colors-brand) var(--un-bg-opacity), transparent);}`)
    expect(css).toContain(`${activeSelector('badge', kind)}{padding:calc(var(--spacing) * 3);}`)
    expect(css).toMatch(/--colors-brand:\s*#123456;/)
    expect(css).toMatch(/--spacing:\s*0\.375rem;/)
    expect(css).not.toMatch(/\.(?:bg-brand|p-3)\s*\{/)
  })

  it.each(['compound', 'slot'] as const)('resolves %s rules again after changing the theme', async (kind) => {
    const component = themedComponent('badge', kind, 'bg-brand p-3 md:opacity-50')
    const varia = presetVaria({ components: [component], manifest: false })
    const config = (color: string, spacing: string, breakpoint: string) => ({
      presets: [presetWind4(), varia],
      theme: { colors: { brand: color }, spacing: { DEFAULT: spacing }, breakpoint: { md: breakpoint } },
    })
    const uno = await createGenerator(config('#123456', '0.375rem', '50rem'))
    const before = await uno.generate('badge badge-active badge__body')
    expect(before.css).toMatch(/--colors-brand:\s*#123456;/)
    expect(before.css).toMatch(/--spacing:\s*0\.375rem;/)
    expect(before.css).toContain(`@media (min-width: 50rem){${activeSelector('badge', kind)}{opacity:50%;}}`)

    await uno.setConfig(config('#abcdef', '0.5rem', '60rem'))
    const after = await uno.generate('badge badge-active badge__body flex')
    expect(after.css).toMatch(/--colors-brand:\s*#abcdef;/)
    expect(after.css).toMatch(/--spacing:\s*0\.5rem;/)
    expect(after.css).toContain(`@media (min-width: 60rem){${activeSelector('badge', kind)}{opacity:50%;}}`)
    expect(after.css).toContain('.flex{display:flex;}')
    expect(after.css).not.toMatch(/#123456|0\.375rem|50rem/)
  })

  it('removes old component styles and dependencies when replacing presets', async () => {
    const oldComponent = themedComponent('old', 'compound', 'bg-legacy animate-spin')
    const newComponent = themedComponent('new', 'slot', 'bg-current animate-pulse')
    const uno = await createGenerator({
      presets: [presetWind4(), presetVaria({ components: [oldComponent], manifest: false })],
      theme: { colors: { legacy: '#123456' } },
    })
    const before = await uno.generate('old old-active')
    expect(before.css).toContain('.old-active{animation:spin')
    expect(before.css).toMatch(/--colors-legacy:\s*#123456;/)
    expect(before.css).toContain('@keyframes spin')

    await uno.setConfig({
      presets: [presetWind4(), presetVaria({ components: [newComponent], manifest: false })],
      theme: { colors: { current: '#abcdef' } },
    })
    // Include the removed classes too, so cached shortcuts cannot hide here.
    const after = await uno.generate('old old-active new new-active new__body')
    expect(after.css).toContain('.new-active .new__body{animation:pulse')
    expect(after.css).toMatch(/--colors-current:\s*#abcdef;/)
    expect(after.css).toContain('@keyframes pulse')
    expect(after.css).not.toMatch(/\.old[\s.{-]|--colors-legacy|@keyframes spin/)
  })

  it.each([false, true])('includes every Varia preset and its dependencies, reversed=%s', async (reversed) => {
    const presets = [
      presetVaria({ components: [themedComponent('first', 'compound', 'bg-primary animate-spin')], manifest: false }),
      presetVaria({ components: [themedComponent('second', 'slot', 'bg-secondary animate-pulse')], manifest: false }),
    ]
    if (reversed)
      presets.reverse()
    const uno = await createGenerator({
      presets: [presetWind4(), ...presets],
      mergeSelectors: false,
      theme: { colors: { primary: '#123456', secondary: '#abcdef' } },
      preflights: [{ getCSS: () => '.user-preflight{display:grid;}' }],
    })
    for (const input of ['first first-active second second-active second__body', 'second second-active second__body first first-active flex']) {
      const { css } = await uno.generate(input)
      expect(css).toContain('.first{display:block;}')
      expect(css).toContain('.second{display:block;}')
      expect(css).toContain('.first-active{background-color:color-mix(in srgb, var(--colors-primary) var(--un-bg-opacity), transparent);}')
      expect(css).toContain('.second-active .second__body{background-color:color-mix(in srgb, var(--colors-secondary) var(--un-bg-opacity), transparent);}')
      expect(css.match(/\.first-active\{animation:spin/g)).toHaveLength(1)
      expect(css.match(/\.second-active \.second__body\{animation:pulse/g)).toHaveLength(1)
      expect(css).toMatch(/--colors-primary:\s*#123456;/)
      expect(css).toMatch(/--colors-secondary:\s*#abcdef;/)
      expect(css.match(/@keyframes spin/g)).toHaveLength(1)
      expect(css.match(/@keyframes pulse/g)).toHaveLength(1)
      expect(css.match(/\.user-preflight\{display:grid;\}/g)).toHaveLength(1)
      expect(css).not.toMatch(/\.(?:bg-primary|bg-secondary|animate-spin|animate-pulse)\s*\{/)
    }
  })
})

function themedComponent(name: string, kind: 'compound' | 'slot', utilities: string) {
  return kind === 'compound'
    ? defineComponent(name, {
        base: 'block',
        variants: { active: 'block' },
        compoundVariants: [{ when: { active: true }, class: utilities }],
      })
    : defineComponent(name, {
        slots: { root: 'block', body: 'block' },
        variants: { active: { body: utilities } },
      })
}

function activeSelector(name: string, kind: 'compound' | 'slot') {
  return kind === 'compound' ? `.${name}-active` : `.${name}-active .${name}__body`
}

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
