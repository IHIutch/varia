import { describe, expect, it } from 'vitest'
import dropdownComponents, {
  dropdownDivider,
  dropdownItem,
  dropdownMenu,
  dropdownTrigger,
} from '../../recipes/dropdown.config.js'
import { generateRecipeCSS } from './_helpers.js'

describe('recipe: Dropdown (multi-component)', () => {
  it('exports four sibling components with namespaced class names', () => {
    expect(dropdownTrigger.name).toBe('dropdown-trigger')
    expect(dropdownMenu.name).toBe('dropdown-menu')
    expect(dropdownItem.name).toBe('dropdown-item')
    expect(dropdownDivider.name).toBe('dropdown-divider')
  })

  it('default export is the array of all four components for easy spread into presetVaria', () => {
    expect(dropdownComponents).toHaveLength(4)
    expect(dropdownComponents.map(c => c.name).sort()).toEqual([
      'dropdown-divider',
      'dropdown-item',
      'dropdown-menu',
      'dropdown-trigger',
    ])
  })

  it('emits the expected shortcut tuples across all four components', () => {
    const allShortcuts = dropdownComponents.flatMap(c => c.shortcuts)
    expect(allShortcuts).toMatchSnapshot()
  })

  it('all four components register and render through real UnoCSS without collisions', async () => {
    const css = await generateRecipeCSS(
      dropdownComponents,
      'dropdown-trigger dropdown-menu dropdown-menu-align-end dropdown-item dropdown-item-danger dropdown-divider',
    )

    expect(css).toContain('.dropdown-trigger')
    expect(css).toContain('.dropdown-menu')
    expect(css).toContain('.dropdown-item')
    expect(css).toContain('.dropdown-divider')
  })
})
