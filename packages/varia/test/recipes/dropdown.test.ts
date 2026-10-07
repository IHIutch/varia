import { describe, expect, it } from 'vitest'
import dropdown from '../../../../recipes/dropdown.config.js'
import { generateCSS as generateRecipeCSS } from '../helpers/tailwind.js'

describe('recipe: Dropdown', () => {
  it('renders slots and alignment through Tailwind', async () => {
    const css = await generateRecipeCSS(
      [dropdown],
      'dropdown dropdown__trigger dropdown__menu dropdown__item dropdown__divider dropdown-align-end',
    )
    expect(css).toContain('.dropdown__trigger')
    expect(css).toContain('.dropdown__menu')
    expect(css).toContain('.dropdown__item')
    expect(css).toContain('.dropdown__divider')
    expect(css).not.toMatch(/\.dropdown-align-start \.dropdown__menu\{[^}]*left:/)
    expect(css).toMatch(/\.dropdown-align-end \.dropdown__menu\{[^}]*right:/)
  })

  it('keeps menu state and destructive item styling conditional on data attributes', async () => {
    const css = await generateRecipeCSS([dropdown], 'dropdown__menu dropdown__item')
    expect(css).toMatch(/\.dropdown__menu\{[^}]*display:none/)
    expect(css).toMatch(/\.dropdown__menu\[data-state="?open"?\]\{[^}]*display:block/)
    expect(css).toMatch(/\.dropdown__item\[data-variant="?danger"?\]/)
  })
})
