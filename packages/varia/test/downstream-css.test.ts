import { cp, mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { cssRules } from './helpers/css.js'
import { scan } from './helpers/tailwind.js'

it('preserves downstream authored CSS and compiles native @apply in a real Vite build', async () => {
  const fixture = await realpath(await mkdtemp(join(tmpdir(), 'varia-css-consumer-')))
  try {
    await mkdir(join(fixture, 'node_modules/variacss'), { recursive: true })
    await cp(new URL('../dist/', import.meta.url), join(fixture, 'node_modules/variacss/dist'), { recursive: true })
    await cp(new URL('../package.json', import.meta.url), join(fixture, 'node_modules/variacss/package.json'))
    await writeFile(join(fixture, 'consumer.ts'), 'export const classes = \'row col\';')
    const css = await scan(fixture, '.authored { @apply row; color: rgb(1 2 3); } .untouched { opacity: 0.123; }')
    expect(css).not.toContain('@apply')
    const rules = cssRules(css)
    expect(rules).toContainEqual(expect.objectContaining({ selector: '.authored', decls: expect.objectContaining({ display: 'flex' }) }))
    expect(rules).toContainEqual(expect.objectContaining({ selector: '.authored', decls: expect.objectContaining({ color: expect.stringMatching(/^(?:rgb\(1 2 3\)|#010203)$/) }) }))
    expect(rules).toContainEqual(expect.objectContaining({ selector: '.untouched', decls: expect.objectContaining({ opacity: '.123' }) }))
  }
  finally {
    await rm(fixture, { recursive: true, force: true })
  }
})
