import type { UserConfig } from '@unocss/core'
import type { DefinedComponent } from '../src/index.js'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { components as recipes } from '../../../examples/kitchen-sink/recipe-components.js'
import { defineComponent } from '../src/index.js'
import { presetVaria } from '../src/unocss.js'

async function generate(components: DefinedComponent[], classes: string[], config: UserConfig = {}): Promise<string> {
  const uno = await createGenerator({
    ...config,
    presets: [presetWind4({ preflights: { reset: false } }), presetVaria({ components, manifest: false }), ...config.presets ?? []],
  })
  return (await uno.generate(classes.join(' '), { preflights: true })).css
}

describe('unocss integration', () => {
  it('emits base and variant classes on demand without their atomic utilities', async () => {
    const btn = defineComponent('btn', {
      base: 'inline-flex rounded',
      variants: { c: { primary: 'bg-blue-600 text-white hover:bg-blue-700', danger: 'bg-red-600' }, busy: 'animate-spin' },
    })
    expect(await generate([btn], [])).not.toMatch(/\.btn|@keyframes/)
    const css = await generate([btn], ['btn', 'btn-c-primary'])
    expect(css).toMatch(/\.btn\{[^}]*display:inline-flex;/)
    expect(css).toContain('.btn-c-primary:hover{')
    expect(css).not.toMatch(/\.btn-c-danger|\.btn-busy|@keyframes spin|\.bg-blue-600|\.inline-flex/)
  })

  it('activates all descendant slot rules from the variant class alone', async () => {
    const card = defineComponent('card', {
      slots: { root: 'block', title: 'opacity-100' },
      variants: { accent: { root: 'opacity-50', title: 'text-blue-600 hover:text-blue-700 [&>svg]:mr-1 animate-spin' } },
    })
    const css = await generate([card], ['card-accent'])
    expect(css).toContain('.card-accent{opacity:50%;}')
    expect(css).toContain('.card-accent .card__title{')
    expect(css).toContain('.card-accent .card__title:hover{')
    expect(css).toContain('.card-accent .card__title>svg{')
    expect(css).toContain('@keyframes spin')
    expect(css).not.toMatch(/\.card\{|\.card__title\{opacity:100%/)
  })

  it('activates compounds only through their first condition and preserves their states', async () => {
    const btn = defineComponent('btn', {
      variants: { size: { sm: 'p-2', lg: 'p-4' }, square: 'aspect-square' },
      compoundVariants: [
        { when: { size: 'sm', square: true }, class: 'p-1 hover:(bg-blue-600 text-white)' },
        { when: { size: 'lg', square: true }, class: 'p-3 animate-spin' },
      ],
    })
    const css = await generate([btn], ['btn-size-sm'])
    expect(css).toContain('.btn-size-sm.btn-square{')
    expect(css).toMatch(/\.btn-size-sm\.btn-square:hover\{[^}]*color:/)
    expect(css).not.toMatch(/btn-size-lg|@keyframes spin/)
  })

  it('orders component layers before ordinary utilities', async () => {
    const probe = defineComponent('probe', {
      slots: { root: 'opacity-100', title: 'block' },
      variants: { active: 'block opacity-25 p-4', accent: { root: 'opacity-50', title: 'opacity-50' } },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
    })
    const css = await generate([probe], ['probe', 'probe-active', 'probe-accent', 'opacity-100'], { outputToCssLayers: true })
    expect(css).toContain('@layer properties, theme, varia-base, varia-variants, varia-compounds, default;')
    expect(css).toMatch(/@layer varia-base\{\s*\.probe\{opacity:100%;\}/)
    expect(css).toMatch(/@layer varia-variants\{[^@]*\.probe-accent \.probe__title\{opacity:50%;\}/)
    expect(css).toMatch(/@layer varia-compounds\{\s*\.probe-active\.probe-accent\{opacity:75%;\}/)
    expect(css).toMatch(/@layer default\{\s*\.opacity-100\{opacity:100%;\}/)
    expect(css).not.toMatch(/\.probe-active\.probe-active|\.probe-accent\.probe-accent|!important/)
  })

  it('keeps responsive slot and compound rules in their layers', async () => {
    const card = defineComponent('card', {
      slots: { root: 'opacity-100', title: 'opacity-100' },
      variants: { active: { root: 'opacity-50', title: 'opacity-50' }, accent: 'opacity-25' },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
    })
    const css = await generate([card], ['md:card-active', 'card-accent'], { outputToCssLayers: true })
    expect(css).toMatch(/@layer varia-variants\{[\s\S]*@media \(min-width: 48rem\)\{\s*\.md\\:card-active,\s*\.md\\:card-active \.card__title\{opacity:50%;\}/)
    expect(css).toMatch(/@layer varia-compounds\{\s*@media \(min-width: 48rem\)\{\s*\.md\\:card-active\.card-accent\{opacity:75%;\}/)
  })

  it('resolves custom themes, custom rules, responsive states, arbitrary values, and important', async () => {
    const badge = defineComponent('badge', { base: 'bg-brand p-[3px] custom', variants: { active: 'md:opacity-50' } })
    const css = await generate([badge], ['badge', 'md:badge', 'badge-active', '!badge'], {
      theme: { colors: { brand: '#123456' }, breakpoint: { md: '50rem' } },
      rules: [['custom', { 'text-decoration': 'underline' }]],
    })
    expect(css).toContain('--colors-brand: #123456')
    expect(css).toContain('padding:3px')
    expect(css).toContain('text-decoration:underline')
    expect(css).toContain('(min-width: 50rem)')
    expect(css).toContain('.md\\:badge{')
    expect(css).toContain('.\\!badge{')
    expect(css).toContain('padding:3px !important')
  })

  it('keeps class names that begin with a variant prefix', async () => {
    const run = defineComponent('first-run', { base: 'p-2', variants: { wide: 'px-8' } })
    const css = await generate([run], ['first-run', 'md:first-run-wide'])
    expect(css).toContain('.first-run{padding:calc(var(--spacing) * 2);}')
    expect(css).toContain('.md\\:first-run-wide{')
    expect(css).not.toContain(':first-child')
  })

  it('compiles every registered class in the existing kitchen-sink recipes', async () => {
    const css = await generate(recipes, recipes.flatMap(component => component.manifest.classNames))
    expect(css).toContain('.btn{')
    expect(css).toContain('.dropdown-align-end .dropdown__menu{')
    expect(css).toContain('.modal-size-lg .modal__container{')
    expect(css).toContain('@keyframes spin')
    expect(css).toContain('--row-gx:1rem')
    expect(css).toMatch(/\.col-offset-6\{margin-left:calc\(100% \* 6 \/ 12\);\}/)
    expect(css).not.toContain('__varia-')
  })
})

describe('unocss registration and manifests', () => {
  it('rejects duplicate classes within and across presets', async () => {
    const card = defineComponent('card', { slots: { title: 'block' }, variants: { accent: { title: 'opacity-50' } } })
    const clash = defineComponent('card-accent', { base: 'block' })
    expect(() => presetVaria({ components: [card, clash], manifest: false })).toThrow(/Duplicate.*card-accent/)
    expect(() => presetVaria({ components: [card, card], manifest: false })).toThrow(/Duplicate component name/)
    await expect(createGenerator({
      presets: [presetVaria({ components: [card], manifest: false }), presetVaria({ components: [clash], manifest: false })],
    })).rejects.toThrow(/Duplicate.*card-accent/)
  })

  it('aggregates manifests per config and replaces stale classes when config reloads', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'varia-unocss-'))
    try {
      const path = join(dir, 'manifest.d.ts')
      const btn = defineComponent('btn', { base: 'block' })
      const card = defineComponent('card', { base: 'block' })
      const uno = await createGenerator({
        presets: [presetVaria({ components: [btn], manifest: { path } }), presetVaria({ components: [card], manifest: { path } })],
      })
      expect(await readFile(path, 'utf8')).toContain('\'btn\'')
      expect(await readFile(path, 'utf8')).toContain('\'card\'')
      await uno.setConfig({ presets: [presetVaria({ components: [btn], manifest: { path } })] })
      expect(await readFile(path, 'utf8')).not.toContain('\'card\'')
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
