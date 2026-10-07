import type {
  ComponentConfig,
  DefinedComponent,
  VariantDefinition,
} from '../src/index.js'
import type { ComponentManifest, Shortcut } from '../src/internal/types.js'
import { describe, expectTypeOf, it } from 'vitest'
import { defineComponent } from '../src/index.js'

describe('public types', () => {
  it('requires factory output when registering definitions', () => {
    // @ts-expect-error generated structure types are private
    type PrivateShortcut = import('../src/index.js').Shortcut
    // @ts-expect-error generated structure types are private
    type PrivateManifest = import('../src/index.js').ComponentManifest
    // @ts-expect-error generated structure types are private
    type PrivateStyle = import('../src/index.js').ComponentStyle
    // @ts-expect-error hand-authored generated structures are not definitions
    const _fabricated: DefinedComponent = { name: 'btn', shortcuts: [], manifest: { name: 'btn', classNames: [] } }
    expectTypeOf<[PrivateShortcut, PrivateManifest, PrivateStyle, typeof _fabricated]>().toBeObject()
  })
  it('defineComponent returns DefinedComponent', () => {
    const result = defineComponent('btn', { base: 'inline-block' })
    expectTypeOf(result).toEqualTypeOf<DefinedComponent>()
  })

  it('definedComponent has the expected shape', () => {
    expectTypeOf<DefinedComponent>().toMatchTypeOf<{
      name: string
      shortcuts: Shortcut[]
      manifest: ComponentManifest
    }>()
  })

  it('shortcut is a [string, string] tuple', () => {
    expectTypeOf<Shortcut>().toEqualTypeOf<[className: string, expansion: string]>()
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
