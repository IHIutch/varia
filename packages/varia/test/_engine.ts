import type { Adapter, Registration } from './_adapters.js'
import { compile as compileNode } from '@tailwindcss/node'
import { compile } from 'tailwindcss'
import { tailwindVaria } from '../src/tailwind.js'
import { flatten, layers, theme } from './_tailwind.js'

function tailwindCss(plugins: number, extra = ''): string {
  return `${layers}\n${theme}\n${extra}\n${Array.from({ length: plugins }, (_, index) => `@plugin "${index}";`).join('\n')}\n@layer utilities { @tailwind utilities; }`
}

async function tailwindCompile(registrations: Registration[], extra = '', css = tailwindCss(registrations.length, extra)): ReturnType<typeof compile> {
  return compile(css, {
    loadModule: async (id, base) => ({ path: '', base, module: tailwindVaria({ manifest: false, ...registrations[Number(id)]! }) }),
  })
}

export const adapter: Adapter = {
  name: 'tailwind',
  async packaged() {
    const sources: string[] = []
    const base = new URL('./fixtures/', import.meta.url).pathname
    const compiler = await compileNode('@import "varia/tailwind.css"; @import "tailwindcss"; @plugin "./engine.config.ts";', { base, onDependency: path => sources.push(path) })
    return { css: flatten(compiler.build(['fixture', 'fixture-active'])), sources }
  },
  async generate(components, classes, { prefix, custom } = {}) {
    const extra = custom ? '@theme { --color-brand: #123456; --breakpoint-md: 50rem; } @utility custom { text-decoration: underline; }' : ''
    return flatten((await tailwindCompile([{ components, prefix }], extra)).build(classes))
  },
  async apply(components, css) {
    return flatten((await tailwindCompile([{ components }], '', `${tailwindCss(1)}\n${css}`)).build([]))
  },
  register: registrations => tailwindCompile(registrations),
  registerWithoutLayers: components => tailwindCompile([{ components }], '', `${theme}\n@plugin "0";\n@layer utilities { @tailwind utilities; }`),
  important: name => `${name}!`,
  prefixed: prefix => ({
    cls: name => `${prefix}:${name}`,
    activation: name => `.${prefix}\\:${name}`,
    other: name => `[class~="${prefix}:${name}"]`,
  }),
}
