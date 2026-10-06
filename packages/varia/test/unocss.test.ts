// UnoCSS-only behavior. Shared adapter behavior lives in contract.test.ts.

import { loadConfig } from '@unocss/config'
import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { unocss } from './_adapters.js'

describe('unocss adapter', () => {
  it('loads the packaged preset and a TypeScript component config', async () => {
    const { config, sources } = await loadConfig(new URL('./fixtures/', import.meta.url).pathname)
    const uno = await createGenerator(config)
    const { css } = await uno.generate('fixture fixture-active', { preflights: false })
    expect(css).toMatch(/@layer varia\.base\{\s*\.fixture\{display:block;\}/)
    expect(css).toMatch(/@layer varia\.variants\{\s*\.fixture-active\{opacity:50%;\}/)
    expect(sources.some(path => path.endsWith('uno.config.ts'))).toBe(true)
  })

  // Outside the MVP contract: Tailwind attaches these states to the activation class.
  it('applies usage-site states to the slot of slot styles', async () => {
    const card = defineComponent('card', { slots: { root: 'block', title: 'block' }, variants: { accent: { title: 'opacity-50' } } })
    const css = await unocss.generate([card], ['hover:card-accent'])
    expect(css).toContain('.hover\\:card-accent .card__title:hover')
  })
})
