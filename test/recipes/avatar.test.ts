import { describe, expect, it } from 'vitest'
import avatar from '../../recipes/avatar.config.js'
import { generateRecipeCSS } from './_helpers.js'

describe('recipe: Avatar', () => {
  it('emits the expected shortcut tuples', () => {
    expect(avatar.shortcuts).toMatchSnapshot()
  })

  it('CSS custom properties with theme() fallbacks survive through real UnoCSS', async () => {
    const css = await generateRecipeCSS([avatar], 'avatar avatar-s-md avatar-ring')

    expect(css).toContain('--avatar-bg')
    expect(css).toContain('--avatar-fg')
    expect(css).toContain('--avatar-ring')
    expect(css).toMatch(/var\(--avatar-bg,/)
  })
})
