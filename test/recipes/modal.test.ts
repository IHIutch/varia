import { describe, expect, it } from 'vitest'
import modal from '../../recipes/modal.config.js'
import { generateRecipeCSS } from './_helpers.js'

describe('recipe: Modal', () => {
  it('emits a shortcut for every slot (root → bare name, others → BEM)', () => {
    const names = modal.manifest.classNames
    expect(names).toContain('modal')
    expect(names).toContain('modal__container')
    expect(names).toContain('modal__header')
    expect(names).toContain('modal__title')
    expect(names).toContain('modal__description')
    expect(names).toContain('modal__body')
    expect(names).toContain('modal__footer')
    expect(names).toContain('modal__close')
  })

  it('manifest includes size variant class names', () => {
    const names = modal.manifest.classNames
    expect(names).toContain('modal-size-sm')
    expect(names).toContain('modal-size-md')
    expect(names).toContain('modal-size-lg')
    expect(names).toContain('modal-size-xl')
  })

  it('size variant is slot-keyed and emits descendant-selector CSS targeting container', () => {
    // Slot-keyed variants don't appear as plain shortcuts; they live in preflights.
    const shortcutNames = modal.shortcuts.map(([n]) => n)
    expect(shortcutNames).not.toContain('modal-size-sm')
    expect(modal.preflights).toBeDefined()
    expect(modal.preflights!.length).toBeGreaterThan(0)
  })

  it('root slot styles emit as the bare component class', async () => {
    const css = await generateRecipeCSS([modal], 'modal')
    expect(css).toMatch(/\.modal\s*\{[^}]*position:\s*fixed/)
    expect(css).toMatch(/inset:\s*(?:0|calc\(var\(--spacing\)\s*\*\s*0\))/)
  })

  it('container slot emits as BEM-suffixed class with dialog box styling', async () => {
    const css = await generateRecipeCSS([modal], 'modal__container')
    expect(css).toMatch(/\.modal__container\s*\{[^}]*border-radius/)
  })

  it('size variant emits descendant-selector CSS targeting only the container slot', async () => {
    const css = await generateRecipeCSS([modal], 'modal modal-size-md modal__container')
    // The size variant rule should target `.modal-size-md .modal__container`,
    // applying max-width to the container without affecting the backdrop.
    expect(css).toMatch(/\.modal-size-md\s+\.modal__container\s*\{[^}]*max-width/)
  })

  it('descendant-selector rules survive when only the root + variant class are referenced (preflights bypass tree-shaking)', async () => {
    const css = await generateRecipeCSS([modal], 'modal modal-size-lg')
    expect(css).toMatch(/\.modal-size-lg\s+\.modal__container\s*\{[^}]*max-width/)
  })

  it('all four size variants emit rules independently', async () => {
    const css = await generateRecipeCSS(
      [modal],
      'modal modal-size-sm modal-size-md modal-size-lg modal-size-xl modal__container',
    )
    expect(css).toMatch(/\.modal-size-sm\s+\.modal__container\s*\{/)
    expect(css).toMatch(/\.modal-size-md\s+\.modal__container\s*\{/)
    expect(css).toMatch(/\.modal-size-lg\s+\.modal__container\s*\{/)
    expect(css).toMatch(/\.modal-size-xl\s+\.modal__container\s*\{/)
  })

  it('shortcuts snapshot for visual review', () => {
    expect(modal.shortcuts).toMatchSnapshot()
  })
})
