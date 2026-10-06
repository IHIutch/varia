import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  emitResolvedCSS,
  resolveUtilities,
} from '../src/internal/resolve-utilities.js'

let uno: UnoGenerator

beforeAll(async () => {
  uno = await createGenerator({ presets: [presetWind4()] })
})

describe('resolveUtilities', () => {
  it('resolves a single utility to a base CSS declaration', async () => {
    const result = await resolveUtilities('bg-blue-600', uno)
    expect(emitResolvedCSS('.test', result)).toMatch(/background-color\s*:/)
    expect(emitResolvedCSS('.test', result)).toContain('var(--colors-blue-600)')
  })

  it('separates base utilities from hover variants', async () => {
    const result = await resolveUtilities('bg-blue-600 hover:bg-blue-700', uno)
    expect(emitResolvedCSS('.test', result)).toMatch(/\.test\{[^}]*var\(--colors-blue-600\)/)
    expect(emitResolvedCSS('.test', result)).toMatch(/\.test:hover\{[^}]*var\(--colors-blue-700\)/)
  })

  it('separates focus-visible, disabled, and other pseudo-class states', async () => {
    const result = await resolveUtilities(
      'bg-white focus-visible:ring-2 disabled:opacity-50',
      uno,
    )
    expect(emitResolvedCSS('.test', result)).toContain('.test:focus-visible{')
    expect(emitResolvedCSS('.test', result)).toContain('.test:disabled{')
    expect(emitResolvedCSS('.test', result)).toMatch(/\.test:disabled\{[^}]*opacity/)
  })

  it('handles arbitrary-value utilities including theme() lookups', async () => {
    const result = await resolveUtilities(
      'bg-[var(--btn-bg,theme(colors.blue.600))] text-[oklch(0.5_0.2_30)]',
      uno,
    )
    expect(emitResolvedCSS('.test', result)).toContain('--btn-bg')
    expect(emitResolvedCSS('.test', result)).toContain('oklch')
  })

  it('extracts @property declarations to topLevel', async () => {
    const result = await resolveUtilities('bg-blue-600', uno)
    expect(result.topLevel.length).toBeGreaterThan(0)
    const hasUnBgOpacity = result.topLevel.some(rule =>
      rule.includes('--un-bg-opacity'),
    )
    expect(hasUnBgOpacity).toBe(true)
  })

  it('dedupes @property declarations across multiple utilities', async () => {
    const result = await resolveUtilities(
      'bg-blue-600 bg-red-600 bg-emerald-600',
      uno,
    )
    const propertyDecls = result.topLevel.filter(r =>
      r.includes('@property --un-bg-opacity'),
    )
    expect(propertyDecls.length).toBe(1)
  })

  it('preserves @supports conditions on resolved rules', async () => {
    const result = await resolveUtilities('bg-blue-600', uno)
    // Wind4 emits an @supports block for color-mix in oklab fallbacks
    expect(result.rules.some(rule => rule.parent)).toBe(true)
    const supportsKeys = result.rules.map(rule => rule.parent ?? '')
    expect(supportsKeys.some(k => k.includes('@supports'))).toBe(true)
  })

  it('throws on an unresolvable utility', async () => {
    await expect(
      resolveUtilities('definitely-not-a-real-utility-xyz', uno),
    ).rejects.toThrow(/could not resolve utility "definitely-not-a-real-utility-xyz"/)
  })

  it('returns empty result for empty input', async () => {
    const result = await resolveUtilities('', uno)
    expect(result.rules).toEqual([])
    expect(result.topLevel).toEqual([])
  })

  it('handles whitespace-only input as empty', async () => {
    const result = await resolveUtilities('   \n\t  ', uno)
    expect(result.rules).toEqual([])
  })

  it('preserves declarations from multiple base utilities', async () => {
    const result = await resolveUtilities('bg-blue-600 text-white', uno)
    expect(emitResolvedCSS('.test', result)).toContain('background-color')
    expect(emitResolvedCSS('.test', result)).toContain('color')
  })
})

describe('emitResolvedCSS', () => {
  it('wraps base CSS in the provided selector', async () => {
    const resolved = await resolveUtilities('bg-blue-600', uno)
    const css = emitResolvedCSS('.my-component', resolved)
    expect(css).toMatch(/\.my-component\s*\{[^}]*background-color/)
  })

  it('adds pseudo-class suffixes for non-base states', async () => {
    const resolved = await resolveUtilities('bg-blue-600 hover:bg-blue-700', uno)
    const css = emitResolvedCSS('.btn', resolved)
    expect(css).toMatch(/\.btn\s*\{/)
    expect(css).toMatch(/\.btn:hover\s*\{/)
  })

  it('emits at-rule-wrapped declarations inside their @supports block', async () => {
    const resolved = await resolveUtilities('bg-blue-600', uno)
    const css = emitResolvedCSS('.btn', resolved)
    expect(css).toContain('@supports')
    expect(css).toMatch(/@supports[^{]*\{\.btn\{/)
  })

  it('emits top-level rules (e.g., @property) before element selectors', async () => {
    const resolved = await resolveUtilities('bg-blue-600', uno)
    const css = emitResolvedCSS('.btn', resolved)
    const propertyIdx = css.indexOf('@property')
    const btnIdx = css.indexOf('.btn{')
    expect(propertyIdx).toBeGreaterThanOrEqual(0)
    expect(btnIdx).toBeGreaterThan(propertyIdx)
  })

  it('supports descendant selectors (the slot-keyed variant use case)', async () => {
    const resolved = await resolveUtilities('text-blue-900', uno)
    const css = emitResolvedCSS('.card-accent .card__title', resolved)
    expect(css).toMatch(/\.card-accent\s+\.card__title\s*\{[^}]*color/)
  })

  it('supports compound selectors (the compound-variant use case)', async () => {
    const resolved = await resolveUtilities('p-1', uno)
    const css = emitResolvedCSS('.cbtn-s-xs.cbtn-square', resolved)
    expect(css).toMatch(/\.cbtn-s-xs\.cbtn-square\s*\{[^}]*padding/)
  })
})
