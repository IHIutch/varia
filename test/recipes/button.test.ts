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

  it('hover/focus-visible/disabled pseudo-class utilities survive through real UnoCSS', async () => {
    const css = await generateRecipeCSS(
      [button],
      'btn btn-c-primary btn-s-lg btn-outline btn-block',
    )

    expect(css).toMatch(/:hover\s*{[^}]*background-color/)
    expect(css).toMatch(/:focus-visible/)
    expect(css).toMatch(/:disabled/)
    expect(css).toMatch(/:active/)
    expect(css).toContain('transition')
  })

  it('only generates CSS for classes the consumer references (JIT)', async () => {
    const css = await generateRecipeCSS([button], 'btn btn-c-primary')

    expect(css).toContain('btn')
    expect(css).not.toMatch(/\.btn-c-danger\b/)
  })
})
