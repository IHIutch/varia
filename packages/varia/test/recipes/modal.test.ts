import { describe, expect, it } from 'vitest'
import modal from '../../../../recipes/modal.config.js'
import { generateCSS as generateRecipeCSS } from '../helpers/tailwind.js'

describe('recipe: Modal', () => {
  it('size variant emits descendant-selector CSS targeting only the container slot', async () => {
    const css = await generateRecipeCSS([modal], 'modal modal-size-md modal__container')
    // The size variant rule should target `.modal-size-md .modal__container`,
    // applying max-width to the container without affecting the backdrop.
    expect(css).toMatch(/\.modal-size-md\s+\.modal__container\s*\{[^}]*max-width/)
  })
})
