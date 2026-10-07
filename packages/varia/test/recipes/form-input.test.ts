import { describe, expect, it } from 'vitest'
import formInput from '../../../../recipes/form-input.config.js'
import { generateCSS as generateRecipeCSS } from '../helpers/tailwind.js'

describe('recipe: Form input', () => {
  it('focus/disabled/invalid/placeholder pseudo-classes survive through Tailwind', async () => {
    const css = await generateRecipeCSS(
      [formInput],
      'form-input form-input-state-error form-input-s-md form-input-readonly',
    )

    expect(css).toMatch(/:focus\b/)
    expect(css).toMatch(/:disabled\b/)
    expect(css).toMatch(/:invalid\b/)
    expect(css).toMatch(/::placeholder\b/)
    expect(css).toMatch(/:read-only\b/)
  })
})
