import type { DefinedComponent } from '../../src/index.js'
import type { TailwindVariaOptions } from '../../src/tailwind.js'
import { readFileSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { optimize } from '@tailwindcss/node'
import { compile } from 'tailwindcss'
import { tailwindVaria } from '../../src/tailwind.js'
import { cssRules } from './css.js'

const require = createRequire(import.meta.url)
export const theme = readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8')
export const layers = readFileSync(new URL('../../src/tailwind.css', import.meta.url), 'utf8')

export function flatten(css: string): string {
  return optimize(css, { minify: false }).code
}

function stylesheet(plugins: number, extra = ''): string {
  return `${layers}\n${theme}\n${extra}\n${Array.from({ length: plugins }, (_, index) => `@plugin "${index}";`).join('\n')}\n@layer utilities { @tailwind utilities; }`
}

/** Compile a stylesheet with one `tailwindVaria` plugin per registration. */
export async function register(registrations: TailwindVariaOptions[], css = stylesheet(registrations.length)): ReturnType<typeof compile> {
  return compile(css, {
    loadModule: async (id, base) => ({ path: '', base, module: tailwindVaria(registrations[Number(id)]!) }),
  })
}

/** Compile without `variacss/tailwind.css`, which the plugin requires. */
export async function registerWithoutLayers(components: DefinedComponent[]): ReturnType<typeof compile> {
  return register([{ components }], `${theme}\n@plugin "0";\n@layer utilities { @tailwind utilities; }`)
}

interface GenerateOptions {
  prefix?: string
  /** Add a `brand` color, a 50rem `md` breakpoint, and a `custom` utility. */
  custom?: boolean
}

export async function generate(components: DefinedComponent[], classes: string[], { prefix, custom }: GenerateOptions = {}): Promise<string> {
  const extra = custom ? '@theme { --color-brand: #123456; --breakpoint-md: 50rem; } @utility custom { text-decoration: underline; }' : ''
  return flatten((await register([{ components, prefix }], stylesheet(1, extra))).build(classes))
}

/** Compile user CSS that applies component classes. */
export async function apply(components: DefinedComponent[], css: string): Promise<string> {
  return flatten((await register([{ components }], `${stylesheet(1)}\n${css}`)).build([]))
}

/** Generate CSS as one `selector{decls}` line per rule, for regex assertions. */
export async function generateCSS(components: DefinedComponent[], classes: string): Promise<string> {
  const css = await generate(components, classes.trim().split(/\s+/))
  const merged = new Map<string, { selector: string, decls: Record<string, string> }>()
  for (const rule of cssRules(css)) {
    const key = JSON.stringify([rule.layer, rule.media, rule.supports, rule.selector])
    const entry = merged.get(key) ?? { selector: rule.selector, decls: {} }
    Object.assign(entry.decls, rule.decls)
    merged.set(key, entry)
  }
  return [...merged.values()].map(({ selector, decls }) => `${selector}{${Object.entries(decls).map(([prop, value]) => `${prop}:${value};`).join('')}}`).join('\n') + (css.match(/@keyframes[\s\S]*/)?.[0] ?? '')
}

/** Build a Vite project in `fixture` that registers the row and col recipes from the installed package. */
export async function scan(fixture: string, authoredCss = ''): Promise<string> {
  const exampleRequire = createRequire(new URL('../../../../examples/kitchen-sink/package.json', import.meta.url))
  const { build } = await import(pathToFileURL(exampleRequire.resolve('vite')).href)
  const { default: tailwindcss } = await import(pathToFileURL(exampleRequire.resolve('@tailwindcss/vite')).href)
  const recipes = new URL('../../../../recipes/', import.meta.url).pathname
  await writeFile(join(fixture, 'package.json'), '{"type":"module"}')
  await writeFile(join(fixture, 'engine.config.ts'), `import { tailwindVaria } from 'variacss/tailwind';
import row from '${recipes}row.config.ts'; import col from '${recipes}col.config.ts';
export default tailwindVaria({ components: [row, col] });`)
  // Resolve the engine stylesheet from the downstream project's dependencies.
  await writeFile(join(fixture, 'styles.css'), `@import "variacss/tailwind.css";
@import "${exampleRequire.resolve('tailwindcss/index.css')}" source(none);
@source "./consumer.ts"; @plugin "./engine.config.ts";
${authoredCss}`)
  await writeFile(join(fixture, 'entry.ts'), 'import \'./styles.css\'; import \'./consumer\';')
  await writeFile(join(fixture, 'index.html'), '<script type="module" src="/entry.ts"></script>')
  await build({ root: fixture, configFile: false, logLevel: 'silent', plugins: [tailwindcss()], build: { minify: false } })
  const assets = join(fixture, 'dist/assets')
  return (await Promise.all((await readdir(assets)).filter(name => name.endsWith('.css')).map(name => readFile(join(assets, name), 'utf8')))).join('\n')
}
