import { describe, expect, it } from 'vitest'
import button from '../../recipes/button.config.js'
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
        .filter((s) => s !== ''),
    )
    expect([...axes].sort()).toEqual(['c', 's', 'style'])
  })

  it('color variants set per-component CSS vars via theme()', async () => {
    const css = await generateRecipeCSS(
      [button],
      'btn btn-c-primary btn-style-solid btn-s-md',
    )
    // The c-primary variant should have set --btn-bg and friends, then the
    // style-solid variant should consume --btn-bg.
    expect(css).toContain('--btn-bg')
    expect(css).toContain('--btn-text')
    expect(css).toContain('--btn-border')
  })

  it('style variants pick different roles from the per-component vars', async () => {
    const solid = await generateRecipeCSS([button], 'btn btn-style-solid')
    expect(solid).toMatch(/var\(--btn-bg[,)]/)

    const outline = await generateRecipeCSS([button], 'btn btn-style-outline')
    expect(outline).toMatch(/var\(--btn-text[,)]/)
    expect(outline).toMatch(/var\(--btn-border[,)]/)

    const subtle = await generateRecipeCSS([button], 'btn btn-style-subtle')
    expect(subtle).toMatch(/var\(--btn-bg-subtle[,)]/)

    const ghost = await generateRecipeCSS([button], 'btn btn-style-ghost')
    expect(ghost).toMatch(/var\(--btn-text[,)]/)
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

  it('only generates CSS for classes the consumer references (JIT)', async () => {
    const css = await generateRecipeCSS(
      [button],
      'btn btn-c-primary btn-style-solid',
    )
    expect(css).toContain('btn')
    expect(css).not.toMatch(/\.btn-c-danger\b/)
    expect(css).not.toMatch(/\.btn-style-outline\b/)
  })
})
