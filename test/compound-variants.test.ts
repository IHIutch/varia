import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { presetVaria } from '../src/preset.js'

async function generate(
  component: ReturnType<typeof defineComponent>,
  classes: string,
): Promise<string> {
  const uno = await createGenerator({
    presets: [
      presetWind4(),
      presetVaria({ components: [component], manifest: false }),
    ],
  })
  const { css } = await uno.generate(classes)
  return css
}

describe('compound variants: validation', () => {
  it('throws if when references an undeclared axis', () => {
    expect(() =>
      defineComponent('btn', {
        base: 'inline-flex',
        variants: { s: { sm: 'p-2', md: 'p-4' } },
        compoundVariants: [
          { when: { square: true }, class: 'p-1' }, // square not declared
        ],
      }),
    ).toThrow(/references variant axis "square"/)
  })

  it('throws if when references a multi-value axis with an unknown value', () => {
    expect(() =>
      defineComponent('btn', {
        base: 'inline-flex',
        variants: { s: { sm: 'p-2', md: 'p-4' } },
        compoundVariants: [
          { when: { s: 'xl' }, class: 'p-6' }, // xl not declared
        ],
      }),
    ).toThrow(/"s" to "xl"/)
  })

  it('throws if when references a boolean axis with a non-true value', () => {
    expect(() =>
      defineComponent('btn', {
        base: 'inline-flex',
        variants: { square: 'aspect-square', s: { sm: 'p-2' } },
        compoundVariants: [
          { when: { square: 'false', s: 'sm' }, class: 'p-1' } as never,
        ],
      }),
    ).toThrow(/boolean variant/)
  })

  it('throws on empty when clause', () => {
    expect(() =>
      defineComponent('btn', {
        base: 'inline-flex',
        variants: { s: { sm: 'p-2' } },
        compoundVariants: [{ when: {}, class: 'p-1' }],
      }),
    ).toThrow(/empty "when" clause/)
  })

  it('throws on empty class', () => {
    expect(() =>
      defineComponent('btn', {
        base: 'inline-flex',
        variants: { s: { sm: 'p-2' } },
        compoundVariants: [{ when: { s: 'sm' }, class: '' }],
      }),
    ).toThrow(/empty "class"/)
  })
})

describe('compound variants: emission shape', () => {
  it('does NOT emit a shortcut for the compound (no consumer-facing class)', () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex',
      variants: {
        s: { sm: 'p-2', md: 'p-4' },
        square: 'aspect-square',
      },
      compoundVariants: [
        { when: { s: 'sm', square: true }, class: 'p-1.5' },
      ],
    })

    const shortcutNames = btn.shortcuts.map(([n]) => n)
    // The variant shortcuts are present:
    expect(shortcutNames).toContain('btn-s-sm')
    expect(shortcutNames).toContain('btn-square')
    // But NO synthetic compound class name:
    expect(shortcutNames).not.toContain('btn-s-sm-square')
    expect(shortcutNames).not.toContain('btn-compound-1')
  })

  it('compound class is NOT in the manifest (not a class consumers write)', () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex',
      variants: { s: { sm: 'p-2' }, square: 'aspect-square' },
      compoundVariants: [{ when: { s: 'sm', square: true }, class: 'p-1' }],
    })

    expect(btn.manifest.classNames).not.toContain('btn-s-sm-square')
    expect(btn.manifest.classNames).toContain('btn-s-sm')
    expect(btn.manifest.classNames).toContain('btn-square')
  })

  it('emits a preflight for each compound', () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex',
      variants: { s: { xs: 'p-1', sm: 'p-2', md: 'p-3' }, square: 'aspect-square' },
      compoundVariants: [
        { when: { s: 'xs', square: true }, class: 'p-0.5' },
        { when: { s: 'sm', square: true }, class: 'p-1' },
        { when: { s: 'md', square: true }, class: 'p-1.5' },
      ],
    })

    expect(btn.preflights).toBeDefined()
    expect(btn.preflights!.length).toBe(3)
  })
})

describe('compound variants: end-to-end through real UnoCSS', () => {
  it('compound rule applies with a combined-class selector', async () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex items-center',
      variants: {
        s: { xs: 'px-2 py-1 text-xs', sm: 'px-2.5 py-1.5 text-sm' },
        square: 'aspect-square',
      },
      compoundVariants: [
        { when: { s: 'xs', square: true }, class: 'p-1' },
        { when: { s: 'sm', square: true }, class: 'p-1.5' },
      ],
    })

    const css = await generate(btn, 'btn btn-s-xs btn-square')
    expect(css).toMatch(/\.btn-s-xs\.btn-square\s*\{[^}]*padding/)
  })

  it('compound rules emit independent of which specific combination the consumer references (preflights are unconditional)', async () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex',
      variants: {
        s: { xs: 'p-1', sm: 'p-2', md: 'p-3' },
        square: 'aspect-square',
      },
      compoundVariants: [
        { when: { s: 'xs', square: true }, class: 'p-0.5' },
        { when: { s: 'sm', square: true }, class: 'p-1' },
        { when: { s: 'md', square: true }, class: 'p-1.5' },
      ],
    })

    // Consumer references only s-xs + square — but all three compound rules
    // should be present in the output.
    const css = await generate(btn, 'btn btn-s-xs btn-square')
    expect(css).toMatch(/\.btn-s-xs\.btn-square\s*\{/)
    expect(css).toMatch(/\.btn-s-sm\.btn-square\s*\{/)
    expect(css).toMatch(/\.btn-s-md\.btn-square\s*\{/)
  })

  it('multi-condition compound combines all axes into the selector', async () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex',
      variants: {
        c: { primary: 'text-blue-600', danger: 'text-red-600' },
        s: { sm: 'p-2', md: 'p-3' },
        outline: 'border-2',
      },
      compoundVariants: [
        { when: { c: 'primary', s: 'sm', outline: true }, class: 'ring-2' },
      ],
    })

    const css = await generate(btn, 'btn btn-c-primary btn-s-sm btn-outline')
    expect(css).toMatch(
      /\.btn-c-primary\.btn-s-sm\.btn-outline\s*\{[^}]*box-shadow/,
    )
  })

  it('compound CSS responds to pseudo-class state via the resolver', async () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex',
      variants: {
        c: { primary: 'text-blue-600' },
        outline: 'border-2',
      },
      compoundVariants: [
        {
          when: { c: 'primary', outline: true },
          class: 'hover:bg-blue-50',
        },
      ],
    })

    const css = await generate(btn, 'btn btn-c-primary btn-outline')
    expect(css).toMatch(/\.btn-c-primary\.btn-outline:hover\s*\{[^}]*background-color/)
  })

  it('multiple separate compound rules emit independently', async () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex',
      variants: {
        s: { sm: 'p-2', lg: 'p-4' },
        square: 'aspect-square',
        loading: 'opacity-75',
      },
      compoundVariants: [
        { when: { s: 'sm', square: true }, class: 'p-1.5' },
        { when: { loading: true, square: true }, class: 'cursor-progress' },
      ],
    })

    const css = await generate(btn, 'btn btn-s-sm btn-square btn-loading')
    expect(css).toMatch(/\.btn-s-sm\.btn-square\s*\{/)
    expect(css).toMatch(/\.btn-loading\.btn-square\s*\{/)
  })

  it('component without compoundVariants does not produce preflights', () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex',
      variants: { s: { sm: 'p-2' } },
    })
    expect(btn.preflights).toBeUndefined()
  })
})
