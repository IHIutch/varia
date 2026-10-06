// Tailwind-only behavior. Shared adapter behavior lives in contract.test.ts.

import { compile as compileNode } from '@tailwindcss/node'
import { compile } from 'tailwindcss'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { tailwindVaria } from '../src/tailwind.js'
import { flatten, generator, layers, theme } from './_tailwind.js'

describe('tailwind adapter', () => {
  it.each(['css', 'config'] as const)('matches a prefix configured through %s', async (source) => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'block' },
      variants: { accent: { title: 'text-blue-600' }, active: 'opacity-50' },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'bg-blue-600' }],
    })
    // A CSS prefix is invisible to plugins, so it must be repeated in the options.
    const plugin = tailwindVaria({ components: [card], manifest: false, prefix: source === 'css' ? 'tw' : undefined })
    const compiler = await compile(`${theme}\n${layers}\n${source === 'css' ? '@theme prefix(tw) {}' : ''}\n${source === 'config' ? '@config "config";' : '@plugin "varia";'}\n@layer utilities { @tailwind utilities; }`, {
      loadModule: async (_id, base) => ({ path: '', base, module: source === 'config' ? { prefix: 'tw', plugins: [plugin] } : plugin }),
    })
    const css = flatten(compiler.build(['tw:card', 'tw:card-accent', 'tw:card-active', 'tw:md:card']))
    expect(css).toContain('.tw\\:card {')
    expect(css).toContain('[class~="tw:card__title"]')
    expect(css).toContain('[class~="tw:card-accent"]')
    expect(css).toContain('.tw\\:md\\:card')
    expect(css).not.toContain('.tw\\:tw\\:')
  })

  it('applies component classes from reference stylesheets without emitting them', async () => {
    const btn = defineComponent('btn', { base: 'block', variants: { active: 'opacity-50' } })
    const reference = await compile('@reference "reference.css"; .target { @apply btn-active; }', {
      loadStylesheet: async (_id, base) => ({ path: '', base, content: `${theme}\n${layers}\n@plugin "varia"; @layer utilities { @tailwind utilities; }` }),
      loadModule: async (_id, base) => ({ path: '', base, module: tailwindVaria({ components: [btn], manifest: false }) }),
    })
    const css = flatten(reference.build(['btn']))
    expect(css).toContain('.target {')
    expect(css).not.toContain('.btn {')
  })

  it('loads the packaged adapter and a TypeScript component config through the real Node integration', async () => {
    const dependencies: string[] = []
    const base = new URL('./fixtures/', import.meta.url).pathname
    const compiler = await compileNode('@import "varia/tailwind.css"; @import "tailwindcss"; @plugin "./tailwind.config.ts";', { base, onDependency: path => dependencies.push(path) })
    const css = flatten(compiler.build(['fixture', 'fixture-active']))
    expect(css).toContain('.fixture {')
    expect(css).toContain('.fixture-active {')
    expect(css).toContain('@layer base, variants, compounds;')
    expect(css.indexOf('@layer base, variants, compounds;')).toBeLessThan(css.indexOf('@layer varia.'))
    expect(css).not.toContain('--varia')
    expect(dependencies.some(path => path.endsWith('tailwind.config.ts'))).toBe(true)
  })

  // Outside the MVP contract: UnoCSS attaches these states to the slot instead.
  it('applies usage-site states to the activation class of slot styles', async () => {
    const card = defineComponent('card', { slots: { root: 'block', title: 'block' }, variants: { accent: { title: 'opacity-50' } } })
    const css = flatten((await generator([card])).build(['hover:card-accent']))
    expect(css).toContain('.hover\\:card-accent:hover .card__title')
  })
})
