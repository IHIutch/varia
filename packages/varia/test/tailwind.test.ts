import { compile } from 'tailwindcss'
import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { tailwindVaria } from '../src/tailwind.js'
import { flatten, layers, theme } from './_tailwind.js'

describe('tailwind integration', () => {
  it.each(['css', 'config'] as const)('matches a prefix configured through %s', async (source) => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'block' },
      variants: { accent: { title: 'text-blue-600' }, active: 'opacity-50' },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'bg-blue-600' }],
    })
    // A CSS prefix is invisible to plugins, so it must be repeated in the options.
    const plugin = tailwindVaria({ components: [card], manifest: false, prefix: source === 'css' ? 'tw' : undefined })
    const compiler = await compile(`${theme}\n${layers}\n${source === 'css' ? '@theme prefix(tw) {}' : ''}\n${source === 'config' ? '@config "config";' : '@plugin "variacss";'}\n@layer utilities { @tailwind utilities; }`, {
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
      loadStylesheet: async (_id, base) => ({ path: '', base, content: `${theme}\n${layers}\n@plugin "variacss"; @layer utilities { @tailwind utilities; }` }),
      loadModule: async (_id, base) => ({ path: '', base, module: tailwindVaria({ components: [btn], manifest: false }) }),
    })
    const css = flatten(reference.build(['btn']))
    expect(css).toContain('.target {')
    expect(css).not.toContain('.btn {')
  })
})
