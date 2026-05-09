import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { presetVaria } from '../src/preset.js'

describe('presetVaria', () => {
  it('flattens shortcuts from multiple components in order', () => {
    const button = defineComponent('btn', { base: 'inline-block' })
    const alert = defineComponent('alert', { base: 'p-4' })

    const preset = presetVaria({ components: [button, alert] })

    expect(preset.shortcuts).toEqual([
      ['btn', 'inline-block'],
      ['alert', 'p-4'],
    ])
  })

  it('throws on duplicate component names regardless of reference identity (different refs)', () => {
    const button1 = defineComponent('btn', { base: 'inline-block' })
    const button2 = defineComponent('btn', { base: 'block' })

    expect(() => presetVaria({ components: [button1, button2] })).toThrow(
      /Duplicate component name "btn"/,
    )
  })

  it('throws on duplicate component names even when the same reference is passed twice', () => {
    const button = defineComponent('btn', { base: 'inline-block' })

    expect(() => presetVaria({ components: [button, button] })).toThrow(
      /Duplicate component name "btn"/,
    )
  })

  it('throws on duplicate shortcut names across different components', () => {
    const a = defineComponent('btn', { variants: { c: { primary: 'bg-blue-600' } } })
    const b = defineComponent('btn-c-primary', { base: 'bg-red-600' })

    expect(() => presetVaria({ components: [a, b] })).toThrow(/Duplicate shortcut "btn-c-primary"/)
  })

  it('produces a preset with name "varia"', () => {
    const button = defineComponent('btn', { base: 'inline-block' })
    const preset = presetVaria({ components: [button] })

    expect(preset.name).toBe('varia')
  })
})
