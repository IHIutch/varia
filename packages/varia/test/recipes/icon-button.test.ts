import { describe, expect, it } from 'vitest'
import iconButton from '../../../../recipes/icon-button.config.js'
import { generateCSS as generateRecipeCSS } from '../helpers/tailwind.js'

describe('recipe: IconButton', () => {
  it('emits exactly the expected padding for each square size', async () => {
    const css = await generateRecipeCSS([iconButton], 'icon-btn icon-btn-s-xs icon-btn-s-sm icon-btn-s-md icon-btn-s-lg icon-btn-square')
    const rules = Array.from(css.matchAll(/(\.icon-btn-s-(?:xs|sm|md|lg)\.icon-btn-square)\s*\{([^}]*)\}/g))
      .map(([, selector, body]) => [selector, body])
      .sort(([a], [b]) => a!.localeCompare(b!))
    expect(rules).toEqual([
      ['.icon-btn-s-lg.icon-btn-square', 'padding:calc(var(--spacing) * 2.5);'],
      ['.icon-btn-s-md.icon-btn-square', 'padding:calc(var(--spacing) * 2);'],
      ['.icon-btn-s-sm.icon-btn-square', 'padding:calc(var(--spacing) * 1.5);'],
      ['.icon-btn-s-xs.icon-btn-square', expect.stringMatching(/^padding:(?:var\(--spacing\)|calc\(var\(--spacing\) \* 1\));$/)],
    ])
    expect(css).toMatch(/--spacing:\s*\.25rem;/)
  })

  it('base + size + square produces working CSS through Tailwind', async () => {
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
})
