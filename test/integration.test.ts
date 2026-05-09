import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { presetVaria } from '../src/preset.js'

describe('integration with real UnoCSS + presetWind4', () => {
  it('produces correct CSS for a button via shortcuts', async () => {
    const button = defineComponent('btn', {
      base: 'inline-block font-medium rounded',
      variants: {
        c: {
          primary: 'bg-blue-600 text-white hover:bg-blue-700',
        },
        outline: 'bg-transparent border-2',
      },
    })

    const uno = await createGenerator({
      presets: [presetWind4(), presetVaria({ components: [button] })],
    })

    const { css } = await uno.generate('btn btn-c-primary btn-outline')

    expect(css).toContain('display:inline-block')
    expect(css).toMatch(/background-color\s*:/)
    expect(css).toMatch(/border-(width|style)/)
  })
})
