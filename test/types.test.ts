import { describe, expectTypeOf, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import type {
  ComponentConfig,
  ComponentManifest,
  DefinedComponent,
  Shortcut,
  VariantDefinition,
} from '../src/index.js'

describe('public types', () => {
  it('defineComponent returns DefinedComponent', () => {
    const result = defineComponent('btn', { base: 'inline-block' })
    expectTypeOf(result).toEqualTypeOf<DefinedComponent>()
  })

  it('DefinedComponent has the expected shape', () => {
    expectTypeOf<DefinedComponent>().toMatchTypeOf<{
      name: string
      shortcuts: Shortcut[]
      manifest: ComponentManifest
    }>()
  })

  it('Shortcut is a [string, string] tuple', () => {
    expectTypeOf<Shortcut>().toEqualTypeOf<[className: string, expansion: string]>()
  })

  it('VariantDefinition accepts multi-value shape', () => {
    expectTypeOf<{ primary: 'x'; danger: 'x' }>().toMatchTypeOf<VariantDefinition>()
  })

  it('VariantDefinition accepts a bare string (boolean shape)', () => {
    expectTypeOf<string>().toMatchTypeOf<VariantDefinition>()
  })

  it('ComponentConfig allows optional base and variants', () => {
    expectTypeOf<{ base: 'x' }>().toMatchTypeOf<ComponentConfig>()
    expectTypeOf<{ variants: { c: { primary: 'x' } } }>().toMatchTypeOf<ComponentConfig>()
    expectTypeOf<{
      base: 'x'
      variants: { outline: 'y' }
    }>().toMatchTypeOf<ComponentConfig>()
    expectTypeOf<Record<string, never>>().toMatchTypeOf<ComponentConfig>()
  })
})
