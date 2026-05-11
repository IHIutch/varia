import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import {
  cardSlotsProto,
  expectedSlotClasses,
  expectedVariantClasses,
} from '../../../recipes/_proto/card-slots.config.js'

async function generate(classes: string): Promise<string> {
  const uno = await createGenerator({
    presets: [presetWind4(), cardSlotsProto],
  })
  const { css } = await uno.generate(classes)
  return css
}

describe('prototype: slot component (validates ADR-0001)', () => {
  it('slot shortcuts emit when their classes are referenced', async () => {
    const css = await generate(expectedSlotClasses.join(' '))
    expect(css).toContain('.card')
    expect(css).toContain('.card__header')
    expect(css).toContain('.card__title')
    expect(css).toContain('.card__description')
    expect(css).toContain('.card__body')
    expect(css).toContain('.card__footer')
  })

  it('string-returning variants emit as plain shortcuts', async () => {
    const css = await generate(`card ${expectedVariantClasses.join(' ')}`)
    expect(css).toContain('.card-elevated')
  })

  it('slot-keyed variant emits descendant-selector CSS rules', async () => {
    const css = await generate('card card__header card__title card-accent')
    expect(css).toMatch(/\.card-accent\s*\{/)
    expect(css).toMatch(/\.card-accent\s+\.card__header\s*\{/)
    expect(css).toMatch(/\.card-accent\s+\.card__title\s*\{/)
  })

  // The riskiest assumption from ADR-0001: when the consumer's content scan
  // only references `card` and `card-accent` (NOT the descendants like
  // card__header or card__title), do the descendant-selector rules still
  // make it into the output?
  //
  // Preflights are emitted unconditionally — they don't go through UnoCSS's
  // content scan. So the answer is yes by construction. This test locks in
  // that property: emitting slot-keyed variants via preflights bypasses the
  // tree-shaking problem entirely.
  it('descendant-selector rules survive when only the root variant class is referenced', async () => {
    const css = await generate('card card-accent')
    expect(css).toMatch(/\.card-accent\s*\{/)
    expect(css).toMatch(/\.card-accent\s+\.card__header\s*\{/)
    expect(css).toMatch(/\.card-accent\s+\.card__title\s*\{/)
  })

  it('a slot class that is NOT referenced and has NO matching descendant rule is pruned', async () => {
    // card__footer has its own shortcut but no slot-keyed variant rule
    // targeting it. When the consumer doesn't reference card__footer, its
    // shortcut shouldn't appear. (This is regular UnoCSS tree-shaking; we
    // just confirm we haven't broken it.)
    const css = await generate('card')
    expect(css).not.toMatch(/\.card__footer\s*\{/)
  })

  it('utility overrides win against slot-keyed variant rules (specificity check)', async () => {
    // A utility override on card__title (e.g., !text-red-600) should override
    // the slot-keyed accent variant. Using !important via the ! prefix is the
    // documented escape hatch.
    const css = await generate('card card__title card-accent !text-red-600')

    // Both the variant rule's color and the !important override should appear.
    // The !important override takes precedence at render time; the test asserts
    // both rules emit so the cascade can play out correctly in the browser.
    expect(css).toMatch(/\.card-accent\s+\.card__title\s*\{[^}]*color/)
    expect(css).toMatch(/!important/)
  })
})
