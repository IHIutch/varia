// The MVP contract every engine adapter must meet. Each branch runs the same cases
// against its selected engine, comparing normalized rules rather than raw output.

import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { components as recipes } from '../../../examples/kitchen-sink/recipe-components.js'
import { defineComponent } from '../src/index.js'
import { adapters } from './_adapters.js'
import { cssRules, layerOrder } from './_css.js'

const rule = (fields: Record<string, unknown>): unknown => expect.objectContaining(fields)
const decls = (fields: Record<string, string>): unknown => expect.objectContaining(fields)

describe.each(adapters)('$name adapter', (adapter) => {
  it('emits base and variant classes on demand without their atomic utilities', async () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex p-2',
      variants: { c: { primary: 'opacity-50 hover:opacity-75', danger: 'opacity-25' }, busy: 'animate-spin' },
    })
    expect(cssRules(await adapter.generate([btn], []))).not.toContainEqual(rule({ selector: expect.stringMatching(/btn/) }))
    const css = await adapter.generate([btn], ['btn', 'btn-c-primary'])
    const rules = cssRules(css)
    expect(rules).toContainEqual(rule({ layer: 'varia.base', selector: '.btn', decls: decls({ display: 'inline-flex' }) }))
    expect(rules).toContainEqual(rule({ layer: 'varia.variants', selector: '.btn-c-primary', decls: decls({ opacity: '.5' }) }))
    expect(rules).toContainEqual(rule({ layer: 'varia.variants', selector: '.btn-c-primary:hover', decls: decls({ opacity: '.75' }) }))
    expect(rules.map(entry => entry.selector)).not.toContainEqual(expect.stringMatching(/btn-c-danger|btn-busy|\.inline-flex|\.p-2/))
    expect(css).not.toContain('@keyframes spin')
  })

  it('activates descendant slot rules from the variant class alone, with states on the slot', async () => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'opacity-100' },
      variants: { accent: { root: 'opacity-50', title: 'opacity-25 hover:opacity-75 [&>svg]:inline animate-spin' } },
    })
    const css = await adapter.generate([card], ['card-accent'])
    const rules = cssRules(css)
    expect(rules).toContainEqual(rule({ layer: 'varia.variants', selector: '.card-accent', decls: decls({ opacity: '.5' }) }))
    expect(rules).toContainEqual(rule({ layer: 'varia.variants', selector: '.card-accent .card__title', decls: decls({ opacity: '.25' }) }))
    expect(rules).toContainEqual(rule({ selector: '.card-accent .card__title:hover', decls: decls({ opacity: '.75' }) }))
    expect(rules).toContainEqual(rule({ selector: '.card-accent .card__title>svg', decls: decls({ display: 'inline' }) }))
    expect(css).toContain('@keyframes spin')
    expect(rules.map(entry => entry.selector)).not.toContain('.card')
    expect(rules.map(entry => entry.selector)).not.toContain('.card__title')
  })

  it('keeps usage-site states on the activation element and definition states on the slot', async () => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'block' },
      variants: { accent: { title: 'opacity-50 focus:opacity-75' } },
    })
    const rules = cssRules(await adapter.generate([card], ['hover:card-accent']))
    expect(rules).toContainEqual(rule({ selector: '.hover\\:card-accent:hover .card__title', decls: decls({ opacity: '.5' }) }))
    expect(rules).toContainEqual(rule({ selector: '.hover\\:card-accent:hover .card__title:focus', decls: decls({ opacity: '.75' }) }))
  })

  it('preserves literal variant-group punctuation inside arbitrary values', async () => {
    const literal = defineComponent('literal', { base: 'content-[\':(\']' })
    const css = await adapter.generate([literal], ['literal'])
    const literalRules = cssRules(css).filter(entry => entry.selector === '.literal')
    expect(literalRules).toContainEqual(rule({ decls: decls({ content: expect.any(String) }) }))
    expect(literalRules.some(entry => Object.values(entry.decls).some(value => value.includes(':(')))).toBe(true)
  })

  it.each(['base', 'slot', 'compound'] as const)('fails on unknown utilities in an active %s expansion', async (kind) => {
    const component = defineComponent('broken', {
      slots: { root: kind === 'base' ? 'varia-unknown-utility' : 'block', title: 'block' },
      variants: { active: kind === 'slot' ? { title: 'varia-unknown-utility' } : 'opacity-50' },
      compoundVariants: kind === 'compound' ? [{ when: { active: true }, class: 'varia-unknown-utility' }] : undefined,
    })
    await expect(adapter.generate([component], ['broken', 'broken-active'])).rejects.toThrow(/varia-unknown-utility/)
  })

  it('activates compounds through their first condition and keeps their states', async () => {
    const btn = defineComponent('btn', {
      variants: { size: { sm: 'p-2', lg: 'p-4' }, square: 'block' },
      compoundVariants: [
        { when: { size: 'sm', square: true }, class: 'p-3 hover:opacity-50' },
        { when: { size: 'lg', square: true }, class: 'p-4 animate-spin' },
      ],
    })
    const css = await adapter.generate([btn], ['btn-size-sm'])
    const rules = cssRules(css)
    expect(rules).toContainEqual(rule({ layer: 'varia.compounds', selector: '.btn-size-sm.btn-square', decls: decls({ padding: 'calc(var(--spacing) * 3)' }) }))
    expect(rules).toContainEqual(rule({ layer: 'varia.compounds', selector: expect.stringMatching(/^\.btn-size-sm(:hover)?\.btn-square(:hover)?$/), decls: decls({ opacity: '.5' }) }))
    expect(rules.map(entry => entry.selector)).not.toContainEqual(expect.stringMatching(/btn-size-lg/))
    expect(css).not.toContain('@keyframes spin')
  })

  it('orders base, variants, compounds, then ordinary utilities without specificity tricks', async () => {
    const probe = defineComponent('probe', {
      slots: { root: 'opacity-100', title: 'block' },
      variants: { active: 'block opacity-25', accent: { root: 'opacity-50', title: 'opacity-50' } },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }, { when: { accent: true }, class: 'p-2' }],
    })
    const css = await adapter.generate([probe], ['probe', 'probe-active', 'probe-accent', 'opacity-100'])
    const order = layerOrder(css).filter(name => name.startsWith('varia.') || name === 'utilities')
    expect(order).toEqual(['varia.base', 'varia.variants', 'varia.compounds', 'utilities'])
    const rules = cssRules(css)
    expect(rules).toContainEqual(rule({ layer: 'varia.base', selector: '.probe' }))
    expect(rules).toContainEqual(rule({ layer: 'varia.variants', selector: '.probe-accent .probe__title' }))
    expect(rules).toContainEqual(rule({ layer: 'varia.compounds', selector: '.probe-active.probe-accent', decls: decls({ opacity: '.75' }) }))
    expect(rules).toContainEqual(rule({ layer: 'varia.compounds', selector: '.probe-accent', decls: decls({ padding: 'calc(var(--spacing) * 2)' }) }))
    expect(rules).toContainEqual(rule({ layer: 'utilities', selector: '.opacity-100' }))
    expect(css).not.toMatch(/\.probe-active\.probe-active|\.probe-accent\.probe-accent|!important/)
  })

  it('applies responsive usage to slot and compound rules in their layers', async () => {
    const card = defineComponent('card', {
      slots: { root: 'opacity-100', title: 'opacity-100' },
      variants: { active: { root: 'opacity-50', title: 'opacity-50' }, accent: 'opacity-25' },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
    })
    const rules = cssRules(await adapter.generate([card], ['md:card-active', 'card-accent']))
    const media = ['(min-width: 48rem)']
    expect(rules).toContainEqual(rule({ layer: 'varia.variants', media, selector: '.md\\:card-active .card__title' }))
    expect(rules).toContainEqual(rule({ layer: 'varia.compounds', media, selector: '.md\\:card-active.card-accent' }))
  })

  it('resolves custom themes, custom utilities, responsive definitions, and arbitrary values', async () => {
    const badge = defineComponent('badge', { base: 'bg-brand p-[3px] custom', variants: { active: 'md:opacity-50' } })
    const css = await adapter.generate([badge], ['badge', 'md:badge', 'badge-active'], { custom: true })
    const rules = cssRules(css)
    expect(css).toContain('#123456')
    expect(rules).toContainEqual(rule({ selector: '.badge', decls: decls({ 'text-decoration': 'underline' }) }))
    expect(rules).toContainEqual(rule({ selector: '.badge', decls: decls({ padding: '3px' }) }))
    expect(rules).toContainEqual(rule({ media: ['(min-width: 50rem)'], selector: '.md\\:badge' }))
    expect(rules).toContainEqual(rule({ media: ['(min-width: 50rem)'], selector: '.badge-active', decls: decls({ opacity: '.5' }) }))
  })

  it('applies the important modifier to component classes', async () => {
    const btn = defineComponent('btn', { base: 'block' })
    const name = adapter.important('btn')
    expect(cssRules(await adapter.generate([btn], [name]))).toContainEqual(rule({ decls: decls({ display: 'block !important' }) }))
  })

  it('lets user CSS apply component classes', async () => {
    const btn = defineComponent('btn', { base: 'block', variants: { active: 'opacity-50' } })
    const rules = cssRules(await adapter.apply([btn], '.target { @apply btn-active; }'))
    expect(rules).toContainEqual(rule({ selector: '.target', decls: decls({ opacity: '.5' }) }))
    expect(rules.map(entry => entry.selector)).not.toContain('.btn')
  })

  it('keeps class names that begin with a utility variant name', async () => {
    const run = defineComponent('first-run', { base: 'p-2', variants: { wide: 'px-8' } })
    const rules = cssRules(await adapter.generate([run], ['first-run', 'md:first-run-wide']))
    expect(rules).toContainEqual(rule({ selector: '.first-run', decls: decls({ padding: 'calc(var(--spacing) * 2)' }) }))
    expect(rules).toContainEqual(rule({ selector: '.md\\:first-run-wide' }))
  })

  it('compiles every class in the kitchen-sink recipes without unresolved utilities', async () => {
    const css = await adapter.generate(recipes, recipes.flatMap(component => component.manifest.classNames))
    const selectors = cssRules(css).map(entry => entry.selector)
    expect(selectors).toContain('.btn')
    expect(selectors).toContain('.dropdown-align-end .dropdown__menu')
    expect(selectors).toContain('.modal-size-lg .modal__container')
    expect(css).toContain('@keyframes spin')
    expect(css).not.toMatch(/__varia-|@apply/)
  })

  it('rejects duplicate classes within and across registrations, and invalid prefixes', async () => {
    const card = defineComponent('card', { slots: { title: 'block' }, variants: { accent: { title: 'opacity-50' } } })
    const clash = defineComponent('card-accent', { base: 'block' })
    await expect(adapter.register([{ components: [card, clash] }])).rejects.toThrow(/Duplicate.*card-accent/)
    await expect(adapter.register([{ components: [card, card] }])).rejects.toThrow(/Duplicate component name/)
    await expect(adapter.register([{ components: [card] }, { components: [clash] }])).rejects.toThrow(/Duplicate.*card-accent/)
    await expect(adapter.register([{ components: [card], prefix: 'tw-' }])).rejects.toThrow(/prefix/)
  })

  it('fails when the precedence setup is missing', async () => {
    const btn = defineComponent('btn', { base: 'block' })
    await expect(adapter.registerWithoutLayers([btn])).rejects.toThrow(/variacss\/tailwind\.css|outputToCssLayers/)
  })

  it('aggregates manifests per build and replaces stale classes on reload', async () => {
    const dir = await mkdtemp(join(tmpdir(), `varia-${adapter.name}-`))
    try {
      const path = join(dir, 'manifest.d.ts')
      const btn = defineComponent('btn', { base: 'block' })
      const card = defineComponent('card', { base: 'block' })
      await adapter.register([{ components: [btn], manifest: { path } }, { components: [card], manifest: { path } }])
      expect(await readFile(path, 'utf8')).toMatch(/'btn'[\s\S]*'card'/)
      await adapter.register([{ components: [btn], manifest: { path } }])
      expect(await readFile(path, 'utf8')).not.toContain('\'card\'')
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
