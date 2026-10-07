import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'

describe('class naming', () => {
  it('names slots with BEM and variants with name-key-value', () => {
    const card = defineComponent('card', {
      slots: { root: 'block', header: 'p-4', title: 'font-semibold' },
      variants: {
        c: { primary: 'bg-blue-600', danger: 'bg-red-600' },
        outline: 'border-2',
      },
    })

    expect(card.classNames).toEqual(['card', 'card__header', 'card__title', 'card-c-primary', 'card-c-danger', 'card-outline'])
  })

  it('an object value (even with a single key) is multi-value, not boolean', () => {
    const btn = defineComponent('btn', { variants: { mode: { active: 'border-2' } } })
    expect(btn.classNames).toEqual(['btn-mode-active'])
  })

  it('accepts numeric and kebab-friendly variant values', () => {
    const btn = defineComponent('btn', {
      variants: { s: { '1': 'p-1', '2xl': 'p-12' } as Record<string, string> },
    })
    expect(btn.classNames).toEqual(['btn-s-1', 'btn-s-2xl'])
  })

  it('treats class arrays as their space-joined strings', () => {
    const config = (classes: (value: string) => string | string[]) => ({
      slots: { root: classes('block p-4'), title: classes('font-semibold text-lg') },
      variants: {
        outline: classes('bg-transparent border-2'),
        s: { sm: classes('p-2 text-sm') },
        accent: { root: classes('ring-2 ring-blue-500'), title: classes('text-blue-900 underline') },
      },
      compoundVariants: [{ when: { s: 'sm', outline: true } as const, class: classes('border-blue-700 text-blue-700') }],
    })

    expect(defineComponent('card', config(value => value.split(' '))).rules)
      .toEqual(defineComponent('card', config(value => value)).rules)
  })
})

describe('validation', () => {
  it('throws on uppercase component name with the offending name in the message', () => {
    expect(() => defineComponent('Btn', { base: 'inline-block' })).toThrow(/Invalid component name "Btn"/)
  })

  it('throws on component name starting with a digit', () => {
    expect(() => defineComponent('1btn', { base: 'inline-block' })).toThrow(/must match \/\^\[a-z\]/)
  })

  it('throws on uppercase variant value (assembled class fails regex)', () => {
    expect(() => defineComponent('btn', { variants: { c: { Primary: 'bg-blue-600' } } }))
      .toThrow(/Invalid class identifier "btn-c-Primary"/)
  })

  it('throws on whitespace-only expansion with offending class name in the message', () => {
    expect(() => defineComponent('btn', { variants: { c: { primary: '   ' } } }))
      .toThrow(/Empty expansion for "btn-c-primary"/)
  })

  it('throws on empty-string and empty-array expansions', () => {
    expect(() => defineComponent('btn', { base: '' })).toThrow(/Empty expansion for "btn"/)
    expect(() => defineComponent('btn', { base: [] })).toThrow(/Empty expansion for "btn"/)
  })

  it('throws when component has no base and no variants', () => {
    expect(() => defineComponent('btn', {})).toThrow(/no `base`\/`slots` and no `variants`/)
  })

  it('throws when both `base` and `slots` are set', () => {
    expect(() => defineComponent('btn', {
      base: 'inline-block',
      slots: { root: 'inline-block' },
    } as never)).toThrow(/sets both `base` and `slots`/)
  })

  it('throws on empty variant (no values)', () => {
    expect(() => defineComponent('btn', { base: 'inline-block', variants: { c: {} } }))
      .toThrow(/Variant "c" on component "btn" has no values/)
  })
})

describe('slot validation', () => {
  it('throws if no slots are declared', () => {
    expect(() => defineComponent('card', { slots: {} })).toThrow(/has no slots/)
  })

  it('throws on invalid slot name', () => {
    expect(() => defineComponent('card', { slots: { Header: 'p-4' } })).toThrow(/Invalid slot name "Header"/)
  })

  it('throws on empty slot expansion', () => {
    expect(() => defineComponent('card', { slots: { root: 'block', header: '   ' } })).toThrow(/Empty expansion/)
  })

  it('throws if slot-keyed value references a non-existent slot', () => {
    expect(() => defineComponent('card', {
      slots: { root: 'block', body: 'p-4' },
      variants: { variant: { solid: { root: 'bg-blue-600', footer: 'p-2' } } },
    })).toThrow(/references slot "footer"/)
  })
})

describe('compound validation', () => {
  const variants = { s: { sm: 'p-2', md: 'p-4' }, square: 'aspect-square' }

  it('throws if when references an undeclared axis', () => {
    expect(() => defineComponent('btn', {
      variants: { s: { sm: 'p-2' } },
      compoundVariants: [{ when: { square: true }, class: 'p-1' }],
    })).toThrow(/references variant axis "square"/)
  })

  it('throws if when references a multi-value axis with an unknown value', () => {
    expect(() => defineComponent('btn', {
      variants,
      compoundVariants: [{ when: { s: 'xl' }, class: 'p-6' }],
    })).toThrow(/"s" to "xl"/)
  })

  it('throws if when references a boolean axis with a non-true value', () => {
    expect(() => defineComponent('btn', {
      variants,
      compoundVariants: [{ when: { square: 'false', s: 'sm' }, class: 'p-1' } as never],
    })).toThrow(/boolean variant/)
  })

  it('throws on empty when clause', () => {
    expect(() => defineComponent('btn', {
      variants,
      compoundVariants: [{ when: {}, class: 'p-1' }],
    })).toThrow(/empty "when" clause/)
  })

  it('throws on empty class', () => {
    expect(() => defineComponent('btn', {
      variants,
      compoundVariants: [{ when: { s: 'sm' }, class: '' }],
    })).toThrow(/empty "class"/)
  })
})
