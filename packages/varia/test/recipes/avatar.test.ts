import { describe, expect, it } from 'vitest'
import avatar from '../../../../recipes/avatar.config.js'
import { generateCSS as generateRecipeCSS } from '../helpers/tailwind.js'

describe('recipe: Avatar', () => {
  it('custom properties with theme() fallbacks survive through Tailwind', async () => {
    const css = await generateRecipeCSS([avatar], 'avatar avatar-s-md avatar-ring')

    expect(css).toContain('--avatar-bg')
    expect(css).toContain('--avatar-fg')
    expect(css).toContain('--avatar-ring')
    expect(css).toMatch(/var\(--avatar-bg,/)
  })
})
