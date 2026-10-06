import { describe, expect, it } from 'vitest'
import button from '../../../../recipes/button.config.js'
import { generateRecipeCSS } from './_helpers.js'

describe('recipe: Button', () => {
  it('emits the expected shortcut tuples', () => {
    expect(button.shortcuts).toMatchSnapshot()
  })

  it('exposes every expected class name in the manifest', () => {
    expect(button.manifest.classNames).toMatchSnapshot()
  })

  it('has three orthogonal axes (c, style, s) — no per-cell color×shape variants', () => {
    const axes = new Set(
      button.shortcuts
        .map(([name]) => name.replace(/^btn-?/, '').split('-')[0])
        .filter(s => s !== ''),
    )
    expect([...axes].sort()).toEqual(['c', 's', 'style'])
  })

  it('color and style compounds emit resolved colors and their palette variables', async () => {
    const css = await generateRecipeCSS(
      [button],
      'btn btn-c-primary btn-style-solid btn-s-md',
    )
    expect(css).toMatch(/\.btn-c-primary\.btn-style-solid\{[^}]*background-color/)
    expect(css).toContain('var(--colors-blue-600)')
    expect(css).toMatch(/--colors-blue-600\s*:/)
    expect(css).toMatch(/--colors-blue-700\s*:/)
  })

  it('style compounds set the properties for each color and style combination', async () => {
    const css = await generateRecipeCSS([button], 'btn btn-c-primary btn-style-solid')
    expect(css).toMatch(/\.btn-c-primary\.btn-style-solid\{[^}]*var\(--colors-blue-600\)/)
    expect(css).toMatch(/\.btn-c-primary\.btn-style-outline\{[^}]*var\(--colors-blue-700\)/)
    expect(css).toMatch(/\.btn-c-primary\.btn-style-subtle\{[^}]*var\(--colors-blue-50\)/)
    expect(css).toMatch(/\.btn-c-primary\.btn-style-ghost\{[^}]*var\(--colors-blue-700\)/)
  })

  it('state pseudo-class utilities (hover, focus-visible, disabled) survive through real UnoCSS', async () => {
    const css = await generateRecipeCSS(
      [button],
      'btn btn-c-primary btn-style-solid btn-s-md',
    )
    expect(css).toMatch(/:hover/)
    expect(css).toMatch(/:focus-visible/)
    expect(css).toMatch(/:disabled/)
    expect(css).toContain('transition')
  })

  it('omits shortcuts and compounds for unused colors', async () => {
    const css = await generateRecipeCSS(
      [button],
      'btn btn-c-primary btn-style-solid',
    )
    expect(css).toContain('btn')
    expect(css).not.toContain('.btn-c-danger:focus-visible{')
    expect(css).not.toContain('.btn-c-danger.btn-style-solid{')
    expect(css).not.toMatch(/(?:^|\n)\.btn-style-outline\{/)
  })
})
