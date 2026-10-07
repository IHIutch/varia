import { describe, expect, it } from 'vitest'
import avatar from '../../../../recipes/avatar.config.js'
import { generateCSS as generateRecipeCSS } from '../helpers/generate.js'

describe('recipe: Avatar', () => {
  it('emits the expected shortcut tuples', () => {
    expect(avatar.shortcuts).toMatchSnapshot()
  })

  it('cSS custom properties with theme() fallbacks survive through the selected engine', async () => {
    const css = await generateRecipeCSS([avatar], 'avatar avatar-s-md avatar-ring')

    expect(css).toContain('--avatar-bg')
    expect(css).toContain('--avatar-fg')
    expect(css).toContain('--avatar-ring')
    expect(css).toMatch(/var\(--avatar-bg,/)
  })
})
