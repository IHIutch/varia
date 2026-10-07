import type { Adapter, Registration } from './_adapters.js'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { compile as compileNode } from '@tailwindcss/node'
import { compile } from 'tailwindcss'
import { enginePlugin } from '../../../examples/kitchen-sink/engine.js'
import { tailwindVaria } from '../src/tailwind.js'
import { flatten, layers, theme } from './_tailwind.js'

function tailwindCss(plugins: number, extra = ''): string {
  return `${layers}\n${theme}\n${extra}\n${Array.from({ length: plugins }, (_, index) => `@plugin "${index}";`).join('\n')}\n@layer utilities { @tailwind utilities; }`
}

async function tailwindCompile(registrations: Registration[], extra = '', css = tailwindCss(registrations.length, extra)): ReturnType<typeof compile> {
  return compile(css, {
    loadModule: async (id, base) => ({ path: '', base, module: tailwindVaria({ ...registrations[Number(id)]! }) }),
  })
}

export const adapter: Adapter = {
  name: 'tailwind',
  async scan(fixture, prefix, authoredCss = '') {
    const require = createRequire(new URL('../../../examples/kitchen-sink/package.json', import.meta.url))
    const { build } = await import(pathToFileURL(require.resolve('vite')).href)
    const recipes = new URL('../../../recipes/', import.meta.url).pathname
    await writeFile(join(fixture, 'package.json'), '{"type":"module"}')
    await writeFile(join(fixture, 'index.html'), '<script type="module" src="/consumer.ts"></script>')
    await writeFile(join(fixture, 'engine.config.ts'), `import { tailwindVaria } from 'variacss/tailwind';
import row from '${recipes}row.config.ts'; import col from '${recipes}col.config.ts';
export default tailwindVaria({ components: [row, col], prefix: ${JSON.stringify(prefix)} });`)
    // Resolve the engine stylesheet from the downstream project's dependencies.
    await writeFile(join(fixture, 'styles.css'), `@import "variacss/tailwind.css";
@import "${require.resolve('tailwindcss/index.css')}" source(none);
@source "./consumer.ts"; @plugin "./engine.config.ts";
${authoredCss}`)
    await writeFile(join(fixture, 'entry.ts'), 'import \'./styles.css\'; import \'./consumer\';')
    await writeFile(join(fixture, 'index.html'), '<script type="module" src="/entry.ts"></script>')
    await build({ root: fixture, configFile: false, logLevel: 'silent', plugins: [enginePlugin()], build: { minify: false } })
    const assets = join(fixture, 'dist/assets')
    return (await Promise.all((await readdir(assets)).filter(name => name.endsWith('.css')).map(name => readFile(join(assets, name), 'utf8')))).join('\n')
  },
  async packaged() {
    const sources: string[] = []
    const base = new URL('./fixtures/', import.meta.url).pathname
    const compiler = await compileNode('@import "variacss/tailwind.css"; @import "tailwindcss"; @plugin "./engine.config.ts";', { base, onDependency: path => sources.push(path) })
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
