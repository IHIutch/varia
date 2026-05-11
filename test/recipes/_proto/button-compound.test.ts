import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { buttonCompoundProto } from '../../../recipes/_proto/button-compound.config.js'

async function generate(classes: string): Promise<string> {
  const uno = await createGenerator({
    presets: [presetWind4(), buttonCompoundProto],
  })
  const { css } = await uno.generate(classes)
  return css
}

describe('prototype: compound variants (validates ADR-0002)', () => {
  it('compound rule with combined selector emits in CSS', async () => {
    const css = await generate('cbtn cbtn-s-xs cbtn-square')
    expect(css).toMatch(/\.cbtn-s-xs\.cbtn-square\s*\{[^}]*padding/)
  })

  it('emits all size × square compounds (preflights are unconditional)', async () => {
    // Consumer references only one combination, but ALL compound rules
    // should be present in the output (preflights bypass tree-shaking).
    const css = await generate('cbtn cbtn-s-xs cbtn-square')
    expect(css).toMatch(/\.cbtn-s-xs\.cbtn-square/)
    expect(css).toMatch(/\.cbtn-s-sm\.cbtn-square/)
    expect(css).toMatch(/\.cbtn-s-md\.cbtn-square/)
    expect(css).toMatch(/\.cbtn-s-lg\.cbtn-square/)
  })

  it('compound rule wins specificity vs single-class shortcut', async () => {
    // .cbtn-s-xs.cbtn-square has specificity (0, 2, 0).
    // .cbtn-s-xs is a class with specificity (0, 1, 0).
    // So compound padding overrides cbtn-s-xs's padding for square buttons.
    const css = await generate('cbtn cbtn-s-xs cbtn-square')

    // Both rules should be emitted; the cascade resolves order at render.
    expect(css).toMatch(/\.cbtn-s-xs\s*\{[^}]*padding/)        // single-class
    expect(css).toMatch(/\.cbtn-s-xs\.cbtn-square\s*\{[^}]*padding/) // compound
  })

  it('multi-axis compound (loading × leading) targets a descendant slot', async () => {
    const css = await generate('cbtn cbtn-loading cbtn-leading cbtn__icon')
    expect(css).toMatch(/\.cbtn-loading\.cbtn-leading\s+\.cbtn__icon\s*\{[^}]*animation/)
  })

  it('compound rule is NOT emitted as a standalone class (no consumer-facing class)', async () => {
    const css = await generate('cbtn cbtn-s-xs cbtn-square')

    // There should be no `.cbtn-xs-square` or similar synthetic compound class.
    // The compound IS the combined selector; consumers don't write a separate
    // class for it. This is the load-bearing ergonomic property of ADR-0002.
    expect(css).not.toMatch(/\.cbtn-xs-square\b/)
    expect(css).not.toMatch(/\.cbtn-compound-/)
  })

  it('compound rules behave like preflights and apply when classes co-occur on one element', async () => {
    // The compound selector .cbtn-s-md.cbtn-square only matches elements that
    // have BOTH classes. Single-class consumers don't get the compound styling.
    // This test confirms the compound rule exists with the combined-class
    // selector (not just .cbtn-s-md alone).
    const css = await generate('cbtn cbtn-s-md cbtn-square')
    expect(css).toMatch(/\.cbtn-s-md\.cbtn-square\s*\{[^}]*padding\s*:\s*0\.5rem/)
  })
})
