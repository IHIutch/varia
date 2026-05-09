import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import { presetVaria } from '../src/preset.js'

import button from '../recipes/button.config.js'
import card from '../recipes/card.config.js'
import formInput from '../recipes/form-input.config.js'
import spinner from '../recipes/spinner.config.js'
import avatar from '../recipes/avatar.config.js'
import dropdownComponents from '../recipes/dropdown.config.js'

export default defineConfig({
  presets: [
    presetWind4(),
    presetVaria({
      components: [button, card, formInput, spinner, avatar, ...dropdownComponents],
      manifest: false,
    }),
  ],
})
