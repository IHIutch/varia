import { describe, expect, it } from 'vitest'
import iconButton from '../../../../recipes/icon-button.config.js'
import { generateRecipeCSS } from './_helpers.js'

describe('recipe: IconButton', () => {
  it('emits shortcuts for base + size + square', () => {
    const names = iconButton.manifest.classNames
    expect(names).toContain('icon-btn')
    expect(names).toContain('icon-btn-s-xs')
    expect(names).toContain('icon-btn-s-sm')
    expect(names).toContain('icon-btn-s-md')
    expect(names).toContain('icon-btn-s-lg')
    expect(names).toContain('icon-btn-square')
  })

  it('does NOT emit a class for the compound (no consumer-facing shortcut)', () => {
    const names = iconButton.manifest.classNames
    expect(names).not.toContain('icon-btn-s-xs-square')
    expect(names).not.toContain('icon-btn-compound-1')
  })

  it('declares one style descriptor per compound rule', () => {
    expect(iconButton.styles).toBeDefined()
    expect(iconButton.styles!.length).toBe(4)
  })

  it('emits exactly the expected padding for each square size', async () => {
    const css = await generateRecipeCSS([iconButton], 'icon-btn icon-btn-s-xs icon-btn-s-sm icon-btn-s-md icon-btn-s-lg icon-btn-square')
    const rules = Array.from(css.matchAll(/(\.icon-btn-s-(?:xs|sm|md|lg)\.icon-btn-square)\s*\{([^}]*)\}/g))
      .map(([, selector, body]) => [selector, body])
      .sort(([a], [b]) => a!.localeCompare(b!))
    expect(rules).toEqual([
      ['.icon-btn-s-lg.icon-btn-square', 'padding:calc(var(--spacing) * 2.5);'],
      ['.icon-btn-s-md.icon-btn-square', 'padding:calc(var(--spacing) * 2);'],
      ['.icon-btn-s-sm.icon-btn-square', 'padding:calc(var(--spacing) * 1.5);'],
      ['.icon-btn-s-xs.icon-btn-square', 'padding:var(--spacing);'],
    ])
    expect(css).toMatch(/--spacing:\s*\.25rem;/)
  })

  it('omits compounds for unused sizes', async () => {
    const css = await generateRecipeCSS([iconButton], 'icon-btn icon-btn-s-xs icon-btn-square')
    expect(css).toMatch(/\.icon-btn-s-xs\.icon-btn-square\s*\{/)
    expect(css).not.toMatch(/\.icon-btn-s-sm\.icon-btn-square\s*\{/)
    expect(css).not.toMatch(/\.icon-btn-s-md\.icon-btn-square\s*\{/)
    expect(css).not.toMatch(/\.icon-btn-s-lg\.icon-btn-square\s*\{/)
  })

  it('base + size + square produces working CSS through real Tailwind', async () => {
    const css = await generateRecipeCSS([iconButton], 'icon-btn icon-btn-s-md icon-btn-square')
    // Base styles present:
    expect(css).toMatch(/display:\s*inline-flex/)
    // Size still applies its size-related utility (text-sm):
    expect(css).toMatch(/font-size/)
    // Square applies aspect-ratio:
    expect(css).toMatch(/aspect-ratio/)
    // The labeled size has wider horizontal padding. The two-class compound
    // overrides both axes with 0.5rem through the compounds layer.
    expect(css).toMatch(/\.icon-btn-s-md\{[^}]*padding-inline:calc\(var\(--spacing\) \* 3\.5\)/)
    expect(css).toMatch(/\.icon-btn-s-md\{[^}]*padding-block:calc\(var\(--spacing\) \* 2\)/)
    expect(css).toContain('.icon-btn-s-md.icon-btn-square{padding:calc(var(--spacing) * 2);}')
  })

  it('shortcuts snapshot for visual review', () => {
    expect(iconButton.shortcuts).toMatchSnapshot()
  })
})
