import type {
  ComponentConfig,
  DefinedComponent,
  VariantDefinition,
} from '../src/index.js'
import { describe, expectTypeOf, it } from 'vitest'

describe('public types', () => {
  it('requires factory output when registering definitions', () => {
    // @ts-expect-error generated structure types are private
    type PrivateRule = import('../src/index.js').ComponentRule
    // @ts-expect-error hand-authored generated structures are not definitions
    const _fabricated: DefinedComponent = { name: 'btn', classNames: [], rules: [] }
    expectTypeOf<[PrivateRule, typeof _fabricated]>().toBeObject()
  })
  it('variantDefinition accepts multi-value shape', () => {
    expectTypeOf<{ primary: 'x', danger: 'x' }>().toMatchTypeOf<VariantDefinition>()
  })

  it('variantDefinition accepts a bare string (boolean shape)', () => {
    expectTypeOf<string>().toMatchTypeOf<VariantDefinition>()
  })

  it('componentConfig allows optional base and variants', () => {
    expectTypeOf<{ base: 'x' }>().toMatchTypeOf<ComponentConfig>()
    expectTypeOf<{ variants: { c: { primary: 'x' } } }>().toMatchTypeOf<ComponentConfig>()
    expectTypeOf<{
      base: 'x'
      variants: { outline: 'y' }
    }>().toMatchTypeOf<ComponentConfig>()
    expectTypeOf<Record<string, never>>().toMatchTypeOf<ComponentConfig>()
  })
})
