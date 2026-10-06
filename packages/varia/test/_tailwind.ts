import type { DefinedComponent } from '../src/index.js'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { optimize } from '@tailwindcss/node'
import { compile } from 'tailwindcss'
import { tailwindVaria } from '../src/tailwind.js'

const require = createRequire(import.meta.url)
export const theme = readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8')
export const layers = readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8')

export async function generator(components: DefinedComponent[], extra = '', options: Parameters<typeof tailwindVaria>[0] = { components }): ReturnType<typeof compile> {
  return compile(`${layers}\n${theme}\n${extra}\n@plugin "varia";\n@layer utilities { @tailwind utilities; }`, {
    loadModule: async (_id, base) => ({ path: '', base, module: tailwindVaria({ manifest: false, ...options }) }),
  })
}

export function flatten(css: string): string {
  return optimize(css, { minify: false }).code
}

export async function generateCSS(components: DefinedComponent[], classes: string): Promise<string> {
  const compiler = await generator(components)
  return flatten(compiler.build(classes.trim().split(/\s+/)))
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/;\s*/g, ';')
    .replace(/:\s+/g, ':')
}
