import presetWind4 from '@unocss/preset-wind4'
import { defineConfig } from 'unocss'
import { presetVaria } from '../../packages/varia/src/preset.js'
import accordion from '../../recipes/accordion.config.js'
import alert from '../../recipes/alert.config.js'
import avatar from '../../recipes/avatar.config.js'
import badge from '../../recipes/badge.config.js'
import breadcrumb from '../../recipes/breadcrumb.config.js'
import button from '../../recipes/button.config.js'
import card from '../../recipes/card.config.js'
import col from '../../recipes/col.config.js'
import dropdown from '../../recipes/dropdown.config.js'
import formInput from '../../recipes/form-input.config.js'
import iconButton from '../../recipes/icon-button.config.js'
import inputGroup from '../../recipes/input-group.config.js'
import modal from '../../recipes/modal.config.js'
import nav from '../../recipes/nav.config.js'
import navbar from '../../recipes/navbar.config.js'
import pagination from '../../recipes/pagination.config.js'
import progress from '../../recipes/progress.config.js'
import row from '../../recipes/row.config.js'
import spinner from '../../recipes/spinner.config.js'
import table from '../../recipes/table.config.js'
import tooltip from '../../recipes/tooltip.config.js'

export default defineConfig({
  presets: [
    presetWind4(),
    presetVaria({
      components: [
        button,
        card,
        formInput,
        spinner,
        avatar,
        dropdown,
        modal,
        iconButton,
        nav,
        badge,
        alert,
        tooltip,
        pagination,
        inputGroup,
        progress,
        accordion,
        breadcrumb,
        table,
        navbar,
        row,
        col,
      ],
      manifest: false,
    }),
  ],
})
