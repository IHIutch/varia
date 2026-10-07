// Prefix cases run separately to isolate engine preset configuration state.

import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { adapters } from './_adapters.js'
import { cssRules } from './_css.js'

describe.each(adapters)('$name adapter', (adapter) => {
  it('prefixes component classes, descendants, compounds, and manifests', async () => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'block' },
      variants: { accent: { title: 'opacity-50 hover:opacity-75 -mt-1' }, active: 'opacity-25' },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'p-2' }],
    })
    const tw = adapter.prefixed('tw')
    const rules = cssRules(await adapter.generate([card], ['card', 'card-accent', tw.cls('card'), tw.cls('card-accent'), tw.cls('card-active')], { prefix: 'tw' }))
    const selectors = rules.map(entry => entry.selector)
    expect(selectors).toContain(tw.activation('card'))
    expect(selectors).toContain(`${tw.activation('card-accent')} ${tw.other('card__title')}`)
    expect(selectors).toContain(`${tw.activation('card-accent')} ${tw.other('card__title')}:hover`)
    expect(rules).toContainEqual(expect.objectContaining({ decls: expect.objectContaining({ 'margin-top': expect.stringMatching(/^calc\(var\(--(?:tw-)?spacing\) \* -1\)$/) }) }))
    expect(selectors).toContain(`${tw.activation('card-active')}${tw.other('card-accent')}`)
    expect(selectors).not.toContain('.card')
    expect(selectors).not.toContain('.card-accent .card__title')

    const dir = await mkdtemp(join(tmpdir(), `varia-${adapter.name}-prefix-`))
    try {
      const path = join(dir, 'manifest.d.ts')
      await adapter.register([{ components: [card], manifest: { path }, prefix: 'tw' }])
      expect(await readFile(path, 'utf8')).toContain(`'${tw.cls('card-accent')}'`)
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
