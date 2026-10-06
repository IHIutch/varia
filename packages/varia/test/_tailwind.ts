import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { optimize } from '@tailwindcss/node'

const require = createRequire(import.meta.url)
export const theme = readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8')
export const layers = readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8')

export function flatten(css: string): string {
  return optimize(css, { minify: false }).code
}
