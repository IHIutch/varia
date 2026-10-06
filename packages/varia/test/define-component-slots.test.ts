import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { generateCSS } from './_tailwind.js'

async function generate(component: ReturnType<typeof defineComponent>, classes: string): Promise<string> {
  return generateCSS([component], classes)
}

describe('defineComponent: basic slot declaration', () => {
  it('emits a shortcut for each slot (root uses bare name; others use BEM)', () => {
    const card = defineComponent('card', {
      slots: {
        root: 'rounded-lg overflow-hidden bg-white',
        header: 'p-4 border-b',
        title: 'font-semibold',
        body: 'p-4',
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
    const card = defineComponent('card', {
      slots: { root: 'block', header: 'p-4' },
    })
    expect(card.manifest.classNames).toContain('card')
    expect(card.manifest.classNames).toContain('card__header')
  })

  it('throws if no slots are declared', () => {
    expect(() =>
      defineComponent('card', { slots: {} }),
    ).toThrow(/has no slots/)
  })

  it('throws on invalid slot name', () => {
    expect(() =>
      defineComponent('card', {
        slots: { Header: 'p-4' },
      }),
    ).toThrow(/Invalid slot name "Header"/)
  })

  it('throws on empty slot expansion', () => {
    expect(() =>
      defineComponent('card', {
        slots: { root: 'block', header: '   ' },
      }),
    ).toThrow(/Empty expansion/)
  })
})

describe('defineComponent: string-returning variants apply to root', () => {
  it('emits a boolean variant as a shortcut applied to root', () => {
    const card = defineComponent('card', {
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
    const card = defineComponent('card', {
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

describe('defineComponent: slot-keyed variants emit style descriptors', () => {
  it('boolean slot-keyed variant produces a style descriptor (not a shortcut)', () => {
    const card = defineComponent('card', {
      slots: { root: 'rounded-lg bg-white', header: 'p-4', title: 'font-semibold' },
      variants: {
        accent: {
          root: 'ring-2 ring-blue-500',
          header: 'bg-blue-50',
          title: 'text-blue-900',
        },
      },
    })

    const shortcutNames = card.shortcuts.map(([n]) => n)
    expect(shortcutNames).not.toContain('card-accent') // not a shortcut
    expect(card.manifest.classNames).toContain('card-accent') // but in the manifest
    expect(card.styles).toBeDefined()
    expect(card.styles!.length).toBeGreaterThan(0)
  })

  it('multi-value variant with slot-keyed values produces a style descriptor per value', () => {
    const card = defineComponent('card', {
      slots: { root: 'rounded-lg bg-white', title: 'font-semibold' },
      variants: {
        variant: {
          solid: { root: 'bg-blue-600 text-white', title: 'text-white' },
          outline: { root: 'bg-transparent ring', title: 'text-gray-900' },
        },
      },
    })

    expect(card.manifest.classNames).toContain('card-variant-solid')
    expect(card.manifest.classNames).toContain('card-variant-outline')
    expect(card.styles!.length).toBe(2)
  })

  it('multi-value variant with mixed string and slot-keyed values', () => {
    const card = defineComponent('card', {
      slots: { root: 'rounded-lg bg-white', title: 'font-semibold' },
      variants: {
        variant: {
          solid: 'bg-blue-600 text-white', // string -> shortcut for root
          accent: { root: 'ring-2', title: 'text-blue-900' }, // slot-keyed -> style descriptor
        },
      },
    })

    const shortcutNames = card.shortcuts.map(([n]) => n)
    expect(shortcutNames).toContain('card-variant-solid')
    expect(shortcutNames).not.toContain('card-variant-accent')
    expect(card.manifest.classNames).toContain('card-variant-accent')
    expect(card.styles!.length).toBe(1)
  })

  it('throws if slot-keyed value references a non-existent slot', () => {
    expect(() =>
      defineComponent('card', {
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
      defineComponent('card', {
        slots: { root: 'block', header: 'p-4' },
        variants: {
          ambiguous: {
            root: 'ring-2', // slot name
            primary: 'bg-blue', // not a slot name
          },
        },
      }),
    ).toThrow(/invalid shape/)
  })
})

describe('defineComponent: end-to-end through real Tailwind', () => {
  it('slot shortcuts resolve correctly and appear in generated CSS', async () => {
    const card = defineComponent('card', {
      slots: {
        root: 'rounded-lg bg-white shadow',
        header: 'p-4 border-b',
        title: 'font-semibold text-gray-900',
      },
    })

    const css = await generate(card, 'card card__header card__title')
    expect(css).toMatch(/\.card\s*\{/)
    expect(css).toMatch(/\.card__header\s*\{/)
    expect(css).toMatch(/\.card__title\s*\{/)
  })

  it('string-returning variant on root produces working CSS', async () => {
    const card = defineComponent('card', {
      slots: { root: 'rounded-lg bg-white' },
      variants: { elevated: 'shadow-xl ring-1 ring-gray-300' },
    })

    const css = await generate(card, 'card card-elevated')
    expect(css).toMatch(/\.card-elevated\s*\{/)
  })

  it('slot-keyed variant emits descendant-selector CSS when its class is used', async () => {
    const card = defineComponent('card', {
      slots: {
        root: 'rounded-lg bg-white',
        header: 'p-4',
        title: 'font-semibold',
      },
      variants: {
        accent: {
          root: 'ring-2 ring-blue-500',
          header: 'bg-blue-50',
          title: 'text-blue-900',
        },
      },
    })

    const css = await generate(card, 'card card-accent card__header card__title')

    // Root variant uses the variants layer.
    expect(css).toMatch(/\.card-accent\s*\{[^}]*box-shadow/)
    // Header: descendant selector
    expect(css).toMatch(/\.card-accent\s+\.card__header\s*\{[^}]*background-color/)
    // Title: descendant selector
    expect(css).toMatch(/\.card-accent\s+\.card__title\s*\{[^}]*color/)
  })

  it('an active slot variant includes descendant rules even when descendant classes are not scanned', async () => {
    const card = defineComponent('card', {
      slots: { root: 'rounded-lg', title: 'font-semibold' },
      variants: {
        accent: { root: 'ring-2', title: 'text-blue-900' },
      },
    })

    // Consumer references only card and card-accent — NOT card__title.
    const css = await generate(card, 'card card-accent')
    // The variant class activates all its slot rules.
    expect(css).toMatch(/\.card-accent\s+\.card__title\s*\{/)
  })

  it('multiple slot-keyed variants emit independent rules', async () => {
    const card = defineComponent('card', {
      slots: { root: 'rounded-lg', title: 'font-semibold' },
      variants: {
        variant: {
          solid: { root: 'bg-blue-600', title: 'text-white' },
          outline: { root: 'ring ring-gray-300', title: 'text-gray-900' },
        },
      },
    })

    const css = await generate(card, 'card card__title card-variant-solid card-variant-outline')

    expect(css).toMatch(/\.card-variant-solid\s+\.card__title\s*\{[^}]*color/)
    expect(css).toMatch(/\.card-variant-outline\s+\.card__title\s*\{[^}]*color/)
  })

  it('slot-keyed variant integrates with state pseudo-classes', async () => {
    const card = defineComponent('interactive-card', {
      slots: { root: 'rounded-lg bg-white cursor-pointer' },
      variants: {
        hoverable: { root: 'hover:bg-blue-50 hover:shadow-md' },
      },
    })

    const css = await generate(card, 'interactive-card interactive-card-hoverable')
    expect(css).toMatch(/\.interactive-card-hoverable:hover\s*\{[^}]*background-color/)
  })
})

describe('defineComponent: array class inputs', () => {
  it('joins slot class arrays with spaces', () => {
    const asArray = defineComponent('card', {
      slots: {
        root: ['rounded-lg', 'border', 'p-4'],
        title: ['font-semibold', 'text-lg'],
      },
    })
    const asString = defineComponent('card', {
      slots: {
        root: 'rounded-lg border p-4',
        title: 'font-semibold text-lg',
      },
    })

    expect(asArray.shortcuts).toEqual(asString.shortcuts)
  })

  it('joins boolean-string variant arrays (applied to root)', () => {
    const result = defineComponent('card', {
      slots: { root: 'rounded' },
      variants: {
        elevated: ['shadow-lg', 'hover:shadow-xl'],
      },
    })

    expect(result.shortcuts).toContainEqual([
      'card-elevated',
      'shadow-lg hover:shadow-xl',
    ])
  })

  it('joins multi-value string arrays (applied to root)', () => {
    const result = defineComponent('card', {
      slots: { root: 'rounded' },
      variants: {
        size: {
          sm: ['p-2', 'text-sm'],
          lg: ['p-6', 'text-lg'],
        },
      },
    })

    expect(result.shortcuts).toContainEqual(['card-size-sm', 'p-2 text-sm'])
    expect(result.shortcuts).toContainEqual(['card-size-lg', 'p-6 text-lg'])
  })

  it('joins arrays inside slot-keyed variant values', () => {
    const result = defineComponent('card', {
      slots: { root: 'rounded', title: 'font-medium' },
      variants: {
        accent: {
          root: ['bg-blue-50', 'border-blue-200'],
          title: ['text-blue-900'],
        },
      },
    })

    // Slot-keyed boolean variant: class name is registered, CSS comes from a style descriptor.
    expect(result.manifest.classNames).toContain('card-accent')
    expect(result.styles).toBeDefined()
    expect(result.styles!.length).toBeGreaterThan(0)
  })
})

describe('defineComponent: compound variants on slot components', () => {
  it('accepts compoundVariants on a slot config and emits a style descriptor', () => {
    const card = defineComponent('card', {
      slots: { root: 'rounded-lg bg-white', title: 'font-semibold' },
      variants: {
        size: { sm: 'p-2', md: 'p-4', lg: 'p-6' },
        elevated: 'shadow-lg',
      },
      compoundVariants: [
        { when: { size: 'lg', elevated: true }, class: 'shadow-2xl' },
      ],
    })

    expect(card.styles).toBeDefined()
    // One style descriptor per compound rule (no slot-keyed variants here).
    expect(card.styles!.length).toBe(1)
  })

  it('compound CSS chains the variant classes in the selector', async () => {
    const card = defineComponent('card', {
      slots: { root: 'rounded-lg bg-white' },
      variants: {
        size: { sm: 'p-2', lg: 'p-6' },
        elevated: 'shadow-lg',
      },
      compoundVariants: [
        { when: { size: 'lg', elevated: true }, class: 'p-8' },
      ],
    })

    const css = await generate(card, 'card card-size-lg card-elevated')
    expect(css).toMatch(/\.card-size-lg\.card-elevated\s*\{/)
  })
})
