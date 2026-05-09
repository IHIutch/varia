import { describe, expect, it } from 'vitest'
import spinner from '../../recipes/spinner.config.js'
import { generateRecipeCSS } from './_helpers.js'

describe('recipe: Spinner', () => {
  it('emits the expected shortcut tuples', () => {
    expect(spinner.shortcuts).toMatchSnapshot()
  })

  it('animation utilities (animate-spin) survive through real UnoCSS', async () => {
    const css = await generateRecipeCSS([spinner], 'spinner spinner-s-md spinner-c-primary')

    expect(css).toMatch(/@keyframes\s+spin\b/)
    expect(css).toMatch(/animation\s*:[^;]*spin/)
    expect(css).toMatch(/border-radius\s*:/)
  })
})
