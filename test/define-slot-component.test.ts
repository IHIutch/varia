import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { defineSlotComponent } from '../src/index.js'
import { presetVaria } from '../src/preset.js'

async function generate(component: ReturnType<typeof defineSlotComponent>, classes: string): Promise<string> {
  const uno = await createGenerator({
    presets: [
      presetWind4(),
      presetVaria({ components: [component], manifest: false }),
    ],
  })
  const { css } = await uno.generate(classes)
  return css
}

describe('defineSlotComponent: basic slot declaration', () => {
  it('emits a shortcut for each slot (root uses bare name; others use BEM)', () => {
    const card = defineSlotComponent('card', {
      slots: {
        root:   'rounded-lg overflow-hidden bg-white',
        header: 'p-4 border-b',
        title:  'font-semibold',
        body:   'p-4',
      },
    })

    expect(card.shortcuts.map(([n]) => n)).toEqual([
      'card',
      'card__header',
      'card__title',
      'card__body',
    ])
  })

  it('manifest includes every slot class name', () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'block', header: 'p-4' },
    })
    expect(card.manifest.classNames).toContain('card')
    expect(card.manifest.classNames).toContain('card__header')
  })

  it('throws if no slots are declared', () => {
    expect(() =>
      defineSlotComponent('card', { slots: {} }),
    ).toThrow(/has no slots/)
  })

  it('throws on invalid slot name', () => {
    expect(() =>
      defineSlotComponent('card', {
        slots: { Header: 'p-4' },
      }),
    ).toThrow(/Invalid slot name "Header"/)
  })

  it('throws on empty slot expansion', () => {
    expect(() =>
      defineSlotComponent('card', {
        slots: { root: 'block', header: '   ' },
      }),
    ).toThrow(/Empty expansion/)
  })
})

describe('defineSlotComponent: string-returning variants apply to root', () => {
  it('emits a boolean variant as a shortcut applied to root', () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'rounded-lg bg-white' },
      variants: {
        elevated: 'shadow-xl',
      },
    })

    const shortcutNames = card.shortcuts.map(([n]) => n)
    expect(shortcutNames).toContain('card-elevated')
    const [, expansion] = card.shortcuts.find(([n]) => n === 'card-elevated')!
    expect(expansion).toBe('shadow-xl')
  })

  it('emits multi-value variants with string values as per-value shortcuts', () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'rounded-lg bg-white' },
      variants: {
        size: {
          sm: 'p-2 text-sm',
          md: 'p-4 text-base',
          lg: 'p-6 text-lg',
        },
      },
    })

    const shortcutNames = card.shortcuts.map(([n]) => n)
    expect(shortcutNames).toContain('card-size-sm')
    expect(shortcutNames).toContain('card-size-md')
    expect(shortcutNames).toContain('card-size-lg')
  })
})

describe('defineSlotComponent: slot-keyed variants emit preflights', () => {
  it('boolean slot-keyed variant produces a preflight (not a shortcut)', () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'rounded-lg bg-white', header: 'p-4', title: 'font-semibold' },
      variants: {
        accent: {
          root:   'ring-2 ring-blue-500',
          header: 'bg-blue-50',
          title:  'text-blue-900',
        },
      },
    })

    const shortcutNames = card.shortcuts.map(([n]) => n)
    expect(shortcutNames).not.toContain('card-accent') // not a shortcut
    expect(card.manifest.classNames).toContain('card-accent') // but in the manifest
    expect(card.preflights).toBeDefined()
    expect(card.preflights!.length).toBeGreaterThan(0)
  })

  it('multi-value variant with slot-keyed values produces a preflight per value', () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'rounded-lg bg-white', title: 'font-semibold' },
      variants: {
        variant: {
          solid:   { root: 'bg-blue-600 text-white', title: 'text-white' },
          outline: { root: 'bg-transparent ring', title: 'text-gray-900' },
        },
      },
    })

    expect(card.manifest.classNames).toContain('card-variant-solid')
    expect(card.manifest.classNames).toContain('card-variant-outline')
    expect(card.preflights!.length).toBe(2)
  })

  it('multi-value variant with mixed string and slot-keyed values', () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'rounded-lg bg-white', title: 'font-semibold' },
      variants: {
        variant: {
          solid:   'bg-blue-600 text-white',                  // string -> shortcut for root
          accent:  { root: 'ring-2', title: 'text-blue-900' }, // slot-keyed -> preflight
        },
      },
    })

    const shortcutNames = card.shortcuts.map(([n]) => n)
    expect(shortcutNames).toContain('card-variant-solid')
    expect(shortcutNames).not.toContain('card-variant-accent')
    expect(card.manifest.classNames).toContain('card-variant-accent')
    expect(card.preflights!.length).toBe(1)
  })

  it('throws if slot-keyed value references a non-existent slot', () => {
    expect(() =>
      defineSlotComponent('card', {
        slots: { root: 'block', body: 'p-4' },
        variants: {
          variant: {
            solid: { root: 'bg-blue-600', footer: 'p-2' }, // footer not declared
          },
        },
      }),
    ).toThrow(/references slot "footer"/)
  })

  it('throws on mixed-key variants (some slot names, some not)', () => {
    expect(() =>
      defineSlotComponent('card', {
        slots: { root: 'block', header: 'p-4' },
        variants: {
          ambiguous: {
            root:    'ring-2', // slot name
            primary: 'bg-blue', // not a slot name
          },
        },
      }),
    ).toThrow(/invalid shape/)
  })
})

describe('defineSlotComponent: end-to-end through real UnoCSS', () => {
  it('slot shortcuts resolve correctly and appear in generated CSS', async () => {
    const card = defineSlotComponent('card', {
      slots: {
        root:   'rounded-lg bg-white shadow',
        header: 'p-4 border-b',
        title:  'font-semibold text-gray-900',
      },
    })

    const css = await generate(card, 'card card__header card__title')
    expect(css).toMatch(/\.card\s*\{/)
    expect(css).toMatch(/\.card__header\s*\{/)
    expect(css).toMatch(/\.card__title\s*\{/)
  })

  it('string-returning variant on root produces working CSS', async () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'rounded-lg bg-white' },
      variants: { elevated: 'shadow-xl ring-1 ring-gray-300' },
    })

    const css = await generate(card, 'card card-elevated')
    expect(css).toMatch(/\.card-elevated\s*\{/)
  })

  it('slot-keyed variant emits descendant-selector CSS via preflight', async () => {
    const card = defineSlotComponent('card', {
      slots: {
        root:   'rounded-lg bg-white',
        header: 'p-4',
        title:  'font-semibold',
      },
      variants: {
        accent: {
          root:   'ring-2 ring-blue-500',
          header: 'bg-blue-50',
          title:  'text-blue-900',
        },
      },
    })

    const css = await generate(card, 'card card-accent card__header card__title')

    // Root variant: single class
    expect(css).toMatch(/\.card-accent\s*\{[^}]*box-shadow/)
    // Header: descendant selector
    expect(css).toMatch(/\.card-accent\s+\.card__header\s*\{[^}]*background-color/)
    // Title: descendant selector
    expect(css).toMatch(/\.card-accent\s+\.card__title\s*\{[^}]*color/)
  })

  it('slot-keyed variant rules are present even when descendants are not referenced (preflight bypasses tree-shaking)', async () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'rounded-lg', title: 'font-semibold' },
      variants: {
        accent: { root: 'ring-2', title: 'text-blue-900' },
      },
    })

    // Consumer references only card and card-accent — NOT card__title.
    const css = await generate(card, 'card card-accent')
    // The descendant rule should still emit (preflights are unconditional).
    expect(css).toMatch(/\.card-accent\s+\.card__title\s*\{/)
  })

  it('multiple slot-keyed variants emit independent rules', async () => {
    const card = defineSlotComponent('card', {
      slots: { root: 'rounded-lg', title: 'font-semibold' },
      variants: {
        variant: {
          solid:   { root: 'bg-blue-600',  title: 'text-white' },
          outline: { root: 'ring ring-gray-300', title: 'text-gray-900' },
        },
      },
    })

    const css = await generate(card, 'card card__title card-variant-solid card-variant-outline')

    expect(css).toMatch(/\.card-variant-solid\s+\.card__title\s*\{[^}]*color/)
    expect(css).toMatch(/\.card-variant-outline\s+\.card__title\s*\{[^}]*color/)
  })

  it('slot-keyed variant integrates with state pseudo-classes', async () => {
    const card = defineSlotComponent('interactive-card', {
      slots: { root: 'rounded-lg bg-white cursor-pointer' },
      variants: {
        hoverable: { root: 'hover:bg-blue-50 hover:shadow-md' },
      },
    })

    const css = await generate(card, 'interactive-card interactive-card-hoverable')
    expect(css).toMatch(/\.interactive-card-hoverable:hover\s*\{[^}]*background-color/)
  })
})
