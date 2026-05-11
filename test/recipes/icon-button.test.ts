import { describe, expect, it } from 'vitest'
import iconButton from '../../recipes/icon-button.config.js'
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

  it('declares one preflight per compound rule', () => {
    expect(iconButton.preflights).toBeDefined()
    expect(iconButton.preflights!.length).toBe(4)
  })

  it('compound CSS uses the chained-class selector', async () => {
    const css = await generateRecipeCSS([iconButton], 'icon-btn icon-btn-s-sm icon-btn-square')
    expect(css).toMatch(/\.icon-btn-s-sm\.icon-btn-square\s*\{[^}]*padding/)
  })

  it('every declared compound emits its CSS rule (preflights bypass tree-shaking)', async () => {
    // Consumer references only the s-xs + square combination, but all four
    // compound rules should still appear because preflights are unconditional.
    const css = await generateRecipeCSS([iconButton], 'icon-btn icon-btn-s-xs icon-btn-square')
    expect(css).toMatch(/\.icon-btn-s-xs\.icon-btn-square\s*\{/)
    expect(css).toMatch(/\.icon-btn-s-sm\.icon-btn-square\s*\{/)
    expect(css).toMatch(/\.icon-btn-s-md\.icon-btn-square\s*\{/)
    expect(css).toMatch(/\.icon-btn-s-lg\.icon-btn-square\s*\{/)
  })

  it('base + size + square produces working CSS through real UnoCSS', async () => {
    const css = await generateRecipeCSS([iconButton], 'icon-btn icon-btn-s-md icon-btn-square')
    // Base styles present:
    expect(css).toMatch(/display:\s*inline-flex/)
    // Size still applies its size-related utility (text-sm):
    expect(css).toMatch(/font-size/)
    // Square applies aspect-ratio:
    expect(css).toMatch(/aspect-ratio/)
    // The compound padding wins via the .a.b selector:
    expect(css).toMatch(/\.icon-btn-s-md\.icon-btn-square\s*\{[^}]*padding/)
  })

  it('shortcuts snapshot for visual review', () => {
    expect(iconButton.shortcuts).toMatchSnapshot()
  })
})
