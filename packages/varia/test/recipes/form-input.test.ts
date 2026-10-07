import { describe, expect, it } from 'vitest'
import formInput from '../../../../recipes/form-input.config.js'
import { generateRecipeCSS } from './_helpers.js'

describe('recipe: Form input', () => {
  it('emits the expected shortcut tuples', () => {
    expect(formInput.shortcuts).toMatchSnapshot()
  })

  it('records every expected class name', () => {
    expect(formInput.classNames).toMatchSnapshot()
  })

  it('focus/disabled/invalid/placeholder pseudo-classes survive through the selected engine', async () => {
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
