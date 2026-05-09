import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'

describe('defineComponent', () => {
  it('emits the base class as a shortcut', () => {
    const result = defineComponent('btn', { base: 'inline-block font-medium rounded' })

    expect(result.shortcuts).toEqual([['btn', 'inline-block font-medium rounded']])
  })

  it('emits multi-value variant classes with name-key-value naming', () => {
    const result = defineComponent('btn', {
      base: 'inline-block',
      variants: {
        c: {
          primary: 'bg-blue-600 text-white',
          danger: 'bg-red-600 text-white',
        },
        s: {
          sm: 'px-2 py-1 text-sm',
          lg: 'px-6 py-3 text-lg',
        },
      },
    })

    expect(result.shortcuts).toMatchSnapshot()
  })

  it('returns the expected DefinedComponent shape', () => {
    const result = defineComponent('btn', { base: 'inline-block' })

    expect(result).toMatchObject({
      name: 'btn',
      shortcuts: expect.any(Array),
      manifest: expect.objectContaining({
        name: 'btn',
        classNames: expect.any(Array),
      }),
    })
  })

  it('omits base shortcut when base is undefined', () => {
    const result = defineComponent('btn', {
      variants: {
        c: { primary: 'bg-blue-600' },
      },
    })

    expect(result.shortcuts).toEqual([['btn-c-primary', 'bg-blue-600']])
  })
})

describe('boolean variants', () => {
  it('emits a single name-key class when the variant value is a bare string', () => {
    const result = defineComponent('btn', {
      variants: {
        outline: 'bg-transparent border-2',
      },
    })

    expect(result.shortcuts).toEqual([['btn-outline', 'bg-transparent border-2']])
    expect(result.manifest.classNames).toEqual(['btn-outline'])
  })

  it('coexists with multi-value variants on the same component', () => {
    const result = defineComponent('btn', {
      base: 'inline-block',
      variants: {
        c: { primary: 'bg-blue-600' },
        outline: 'border-2',
      },
    })

    expect(result.shortcuts).toMatchSnapshot()
  })

  it('an object value (even with a single key) is multi-value, not boolean', () => {
    const result = defineComponent('btn', {
      variants: {
        mode: { active: 'border-2' },
      },
    })

    expect(result.shortcuts).toEqual([['btn-mode-active', 'border-2']])
  })
})

describe('validation', () => {
  it('throws on uppercase component name with the offending name in the message', () => {
    expect(() => defineComponent('Btn', { base: 'inline-block' })).toThrow(
      /Invalid component name "Btn"/,
    )
  })

  it('throws on component name starting with a digit', () => {
    expect(() => defineComponent('1btn', { base: 'inline-block' })).toThrow(
      /must match \/\^\[a-z\]/,
    )
  })

  it('accepts numeric variant values and produces correct assembled classes', () => {
    const result = defineComponent('btn', {
      variants: { s: { 1: 'p-1', 2: 'p-2' } as Record<string, string> },
    })
    expect(result.shortcuts).toEqual([
      ['btn-s-1', 'p-1'],
      ['btn-s-2', 'p-2'],
    ])
  })

  it('accepts arbitrary kebab-friendly variant values like 2xl', () => {
    const result = defineComponent('btn', {
      variants: { s: { '2xl': 'p-12 text-2xl' } },
    })
    expect(result.shortcuts).toEqual([['btn-s-2xl', 'p-12 text-2xl']])
  })

  it('throws on whitespace-only expansion with offending class name in the message', () => {
    expect(() =>
      defineComponent('btn', {
        variants: { c: { primary: '   ' } },
      }),
    ).toThrow(/Empty expansion for "btn-c-primary"/)
  })

  it('throws on empty-string expansion', () => {
    expect(() =>
      defineComponent('btn', {
        base: '',
      }),
    ).toThrow(/Empty expansion for "btn"/)
  })

  it('throws when component has no base and no variants', () => {
    expect(() => defineComponent('btn', {})).toThrow(/no `base` and no `variants`/)
  })

  it('throws on uppercase variant value (assembled class fails regex)', () => {
    expect(() =>
      defineComponent('btn', {
        variants: { c: { Primary: 'bg-blue-600' } },
      }),
    ).toThrow(/Invalid class identifier "btn-c-Primary"/)
  })

  it('throws on empty variant (no values)', () => {
    expect(() =>
      defineComponent('btn', {
        base: 'inline-block',
        variants: { c: {} },
      }),
    ).toThrow(/Variant "c" on component "btn" has no values/)
  })
})
