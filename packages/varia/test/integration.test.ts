import { expect, it } from 'vitest'
import { cssRules } from './_css.js'
import { adapter } from './_engine.js'

it('loads the packaged adapter and TypeScript definitions through the engine config loader', async () => {
  const { css, sources } = await adapter.packaged()
  const rules = cssRules(css)
  expect(rules).toContainEqual(expect.objectContaining({ layer: 'varia.base', selector: '.fixture', decls: expect.objectContaining({ display: 'block' }) }))
  expect(rules).toContainEqual(expect.objectContaining({ layer: 'varia.variants', selector: '.fixture-active', decls: expect.objectContaining({ opacity: '.5' }) }))
  expect(sources.some(path => path.endsWith('engine.config.ts'))).toBe(true)
})
