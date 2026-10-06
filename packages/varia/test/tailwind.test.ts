import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { compile as compileNode } from '@tailwindcss/node'
import { compile } from 'tailwindcss'
import { describe, expect, it } from 'vitest'
import { components as recipes } from '../../../examples/kitchen-sink/recipe-components.js'
import { defineComponent } from '../src/index.js'
import { tailwindVaria } from '../src/tailwind.js'
import { flatten, generator, layers, theme } from './_tailwind.js'

describe('tailwind integration', () => {
  it('emits base and variant classes on demand without their atomic utilities', async () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex rounded',
      variants: { c: { primary: 'bg-blue-600 text-white hover:bg-blue-700', danger: 'bg-red-600' }, busy: 'animate-spin' },
    })
    const compiler = await generator([btn])
    expect(compiler.build([])).not.toMatch(/\.btn|@keyframes/)
    const css = flatten(compiler.build(['btn', 'btn-c-primary']))
    expect(css).toContain('.btn {')
    expect(css).toContain('display: inline-flex')
    expect(css).toContain('.btn-c-primary:hover')
    expect(css).not.toMatch(/\.btn-c-danger|\.btn-busy|@keyframes spin|\.bg-blue-600|\.inline-flex/)
  })

  it('activates all descendant slot rules from the variant class alone', async () => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'opacity-100' },
      variants: { accent: { root: 'opacity-50', title: 'text-blue-600 hover:text-blue-700 animate-spin' } },
    })
    const css = flatten((await generator([card])).build(['card-accent']))
    expect(css).toContain('.card-accent {')
    expect(css).toContain('.card-accent .card__title {')
    expect(css).toContain('.card-accent .card__title:hover')
    expect(css).toContain('@keyframes spin')
    expect(css).not.toContain('.card {')
    expect(css).not.toContain('.card__title {\n  opacity: 1')
  })

  it('activates compounds only through their first condition and preserves their states', async () => {
    const btn = defineComponent('btn', {
      variants: { size: { sm: 'p-2', lg: 'p-4' }, square: 'aspect-square' },
      compoundVariants: [
        { when: { size: 'sm', square: true }, class: 'p-1 hover:bg-blue-600' },
        { when: { size: 'lg', square: true }, class: 'p-3 animate-spin' },
      ],
    })
    const css = flatten((await generator([btn])).build(['btn-size-sm']))
    expect(css).toMatch(/\.btn-size-sm\.btn-square(?:\s|\{)/)
    expect(css).toContain('.btn-square:hover')
    expect(css).not.toMatch(/btn-size-lg|@keyframes spin/)
  })

  it('uses ordered layers for precedence and leaves ordinary utilities outside Varia sublayers', async () => {
    const probe = defineComponent('probe', {
      base: 'opacity-100',
      variants: { active: 'block opacity-25 p-4', accent: { root: 'opacity-50' } },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
    })
    const css = flatten((await generator([probe])).build(['probe', 'probe-active', 'probe-accent', 'opacity-100']))
    expect(css).toContain('@layer base, variants, compounds;')
    expect(css.indexOf('@layer base, variants, compounds;')).toBeLessThan(css.indexOf('@layer varia.variants'))
    expect(css).toMatch(/@layer varia\.base\s*\{\s*\.probe\s*\{\s*opacity: 1/)
    expect(css).toContain('@layer varia.variants {')
    expect(css).toContain('.probe-active {')
    expect(css).toContain('.probe-accent {')
    expect(css).toMatch(/@layer varia\.compounds\s*\{\s*\.probe-active\.probe-accent\s*\{[^}]*opacity: \.75/)
    expect(css).toMatch(/\}\s*\.opacity-100\s*\{\s*opacity: 1/)
    expect(css).not.toMatch(/\.probe-active\.probe-active|\.probe-accent\.probe-accent|!important/)
  })

  it('keeps responsive slot and compound rules in their layers without repeating activation selectors', async () => {
    const card = defineComponent('card', {
      slots: { root: 'opacity-100', title: 'opacity-100' },
      variants: { active: { root: 'opacity-50', title: 'opacity-50' }, accent: 'opacity-25' },
      compoundVariants: [
        { when: { active: true, accent: true }, class: 'opacity-75' },
        { when: { accent: true }, class: 'p-2' },
      ],
    })
    const css = flatten((await generator([card])).build(['md:card-active', 'card-accent', 'opacity-100']))
    expect(css).toMatch(/@media \(min-width: 48rem\)\s*\{\s*@layer varia\.variants/)
    expect(css).toContain('.md\\:card-active .card__title')
    expect(css).toContain('.md\\:card-active.card-accent')
    expect(css).toContain('@layer varia.compounds {')
    expect(css).not.toMatch(/\.card-accent\.card-accent|!important/)
  })

  it('resolves custom themes, custom utilities, responsive states, and arbitrary values', async () => {
    const badge = defineComponent('badge', { base: 'bg-brand p-[3px] custom', variants: { active: 'md:opacity-50' } })
    const compiler = await generator([badge], '@theme { --color-brand: #123456; --breakpoint-md: 50rem; } @utility custom { text-decoration: underline; }')
    const css = flatten(compiler.build(['badge', 'md:badge', 'badge-active']))
    expect(css).toContain('--color-brand: #123456')
    expect(css).toContain('padding: 3px')
    expect(css).toContain('text-decoration: underline')
    expect(css).toContain('(min-width: 50rem)')
    expect(css).toContain('.md\\:badge')
  })

  it.each(['plugin', 'css', 'config'] as const)('supports %s prefixes for utilities, descendants, and compounds', async (source) => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'block' },
      variants: { accent: { title: 'text-blue-600' }, active: 'opacity-50' },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'bg-blue-600' }],
    })
    const plugin = tailwindVaria({ components: [card], manifest: false, prefix: source === 'config' ? undefined : 'tw' })
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

  it('supports important output and reference stylesheets without emitting unused components', async () => {
    const btn = defineComponent('btn', { base: 'block', variants: { active: 'opacity-50' } })
    const compiler = await generator([btn])
    expect(flatten(compiler.build(['btn!']))).toContain('display: block !important')
    const reference = await compile('@reference "reference.css"; .target { @apply btn-active; }', {
      loadStylesheet: async (_id, base) => ({ path: '', base, content: `${theme}\n${layers}\n@plugin "varia"; @layer utilities { @tailwind utilities; }` }),
      loadModule: async (_id, base) => ({ path: '', base, module: tailwindVaria({ components: [btn], manifest: false }) }),
    })
    const css = flatten(reference.build(['btn']))
    expect(css).toContain('.target {')
    expect(css).not.toContain('.btn {')
  })

  it('compiles every registered class in the existing kitchen-sink recipes', async () => {
    const compiler = await generator(recipes)
    const css = flatten(compiler.build(recipes.flatMap(component => component.manifest.classNames)))
    expect(css).toContain('.btn')
    expect(css).toContain('.dropdown-align-end .dropdown__menu')
    expect(css).toContain('.modal-size-lg .modal__container')
    expect(css).toContain('@keyframes spin')
    expect(css).toContain('--row-gx: 1rem')
    expect(css).toMatch(/\.col-offset-6\s*\{[^}]*margin-left: 50%/)
    expect(css).not.toContain('@apply')
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
    expect(dependencies.some(path => path.endsWith('tailwind.config.ts'))).toBe(true)
  })

  it('loads built definitions and the Tailwind adapter without any CSS engine installed', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'varia-isolated-'))
    try {
      await cp(new URL('../dist/', import.meta.url), join(dir, 'dist'), { recursive: true })
      const script = `
        import { defineComponent } from ${JSON.stringify(pathToFileURL(join(dir, 'dist/index.mjs')).href)};
        import { tailwindVaria } from ${JSON.stringify(pathToFileURL(join(dir, 'dist/tailwind.mjs')).href)};
        const component = defineComponent('card', {
          slots: { root: 'block', body: 'block' },
          variants: { active: { body: 'opacity-50' } },
          compoundVariants: [{ when: { active: true }, class: 'opacity-75' }],
        });
        const plugin = tailwindVaria({ components: [component], manifest: false });
        console.log(component.styles.length, typeof plugin.handler);
      `
      expect(execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: dir, encoding: 'utf8' }).trim()).toBe('2 function')
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('tailwind registration and manifests', () => {
  it('rejects duplicate classes and invalid prefixes before registration', () => {
    const card = defineComponent('card', { slots: { title: 'block' }, variants: { accent: { title: 'opacity-50' } } })
    expect(() => tailwindVaria({ components: [card, defineComponent('card-accent', { base: 'block' })], manifest: false })).toThrow(/Duplicate.*card-accent/)
    expect(() => tailwindVaria({ components: [card, card], manifest: false })).toThrow(/Duplicate component name/)
    expect(() => tailwindVaria({ components: [card], prefix: 'tw-' })).toThrow(/prefix/)
  })

  it('aggregates manifests per compiler and replaces stale classes when config reloads', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'varia-tailwind-'))
    try {
      const path = join(dir, 'manifest.d.ts')
      const btn = defineComponent('btn', { base: 'block' })
      const card = defineComponent('card', { base: 'block' })
      const modules = { btn: tailwindVaria({ components: [btn], manifest: { path }, prefix: 'tw' }), card: tailwindVaria({ components: [card], manifest: { path }, prefix: 'tw' }) }
      await compile('@plugin "btn"; @plugin "card"; @tailwind utilities;', {
        loadModule: async (id, base) => ({ path: '', base, module: modules[id as keyof typeof modules] }),
      })
      expect(await readFile(path, 'utf8')).toContain('\'tw:btn\'')
      expect(await readFile(path, 'utf8')).toContain('\'tw:card\'')
      await generator([btn], '', { components: [btn], manifest: { path }, prefix: 'tw' })
      expect(await readFile(path, 'utf8')).not.toContain('\'tw:card\'')
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
