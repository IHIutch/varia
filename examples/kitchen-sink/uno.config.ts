import type { UserConfig } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { presetVaria } from 'varia/unocss'
import { components } from './recipe-components.js'

export default {
  // Required by presetVaria: utilities outrank component classes through layers.
  outputToCssLayers: true,
  content: { filesystem: ['./*.html'] },
  presets: [presetWind4(), presetVaria({ components, manifest: false })],
} satisfies UserConfig
