import presetWind4 from '@unocss/preset-wind4'
import { defineComponent } from 'varia'
import { presetVaria } from 'varia/unocss'

export default {
  outputToCssLayers: true,
  presets: [
    presetWind4(),
    presetVaria({
      components: [defineComponent('fixture', { base: 'block', variants: { active: 'opacity-50' } })],
      manifest: false,
    }),
  ],
}
