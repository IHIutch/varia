import { describe, expect, it } from 'vitest'
import card from '../../recipes/card.config.js'
import { generateRecipeCSS } from './_helpers.js'

describe('recipe: Card', () => {
  it('emits a single base shortcut and no variant shortcuts', () => {
    expect(card.shortcuts).toMatchSnapshot()
    expect(card.manifest.classNames).toEqual(['card'])
  })

  it('a base-only component does not throw and produces working CSS through real UnoCSS', async () => {
    const css = await generateRecipeCSS([card], 'card')

    expect(css).toContain('display:block')
    expect(css).toMatch(/border-radius/)
  })
})
