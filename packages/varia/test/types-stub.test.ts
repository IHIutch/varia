import { execFileSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import col from '../../../recipes/col.config.js'
import row from '../../../recipes/row.config.js'
import { adapter } from './_engine.js'

const require = createRequire(import.meta.url)
const tsc = join(dirname(require.resolve('@typescript/native/package.json')), 'bin/tsc')
const fixtures: string[] = []
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map(fixture => rm(fixture, { recursive: true, force: true })))
})

async function downstream(prefix?: string) {
  const fixture = await realpath(await mkdtemp(join(tmpdir(), 'varia-downstream-')))
  fixtures.push(fixture)
  const store = join(fixture, 'node_modules/.pnpm/variacss@1.0.0/node_modules/variacss')
  await mkdir(store, { recursive: true })
  await cp('dist', join(store, 'dist'), { recursive: true })
  await cp('package.json', join(store, 'package.json'))
  await symlink(store, join(fixture, 'node_modules/variacss'), 'dir')
  await symlink(dirname(require.resolve('tailwindcss/package.json')), join(fixture, 'node_modules/tailwindcss'), 'dir')
  const path = join(fixture, 'node_modules/.varia/manifest.d.ts')
  await adapter.register([{ components: [row, col], prefix, manifest: { path } }])
  await writeFile(join(fixture, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', strict: true, noEmit: true },
    files: ['node_modules/.varia/manifest.d.ts'],
    include: ['consumer.ts'],
    exclude: ['node_modules'],
  }))
  const cls = prefix ? adapter.prefixed(prefix).cls : (value: string) => value
  // Tailwind's prefix is before variants; UnoCSS's is on the utility itself.
  const responsive = (breakpoint: string, value: string) => prefix && adapter.name === 'tailwind'
    ? `${prefix}:${breakpoint}:${value}`
    : `${breakpoint}:${cls(value)}`
  const source = `import type { VariaClasses } from 'variacss/types'
import type { DefinedComponent } from 'variacss'
import type { TailwindVariaOptions } from 'variacss/tailwind'
// @ts-expect-error generated structure types are private in the built package
type PrivateStyle = import('variacss').ComponentStyle
// @ts-expect-error definitions must come from the factory
const fabricated: DefinedComponent = { name: 'fake', shortcuts: [], manifest: { name: 'fake', classNames: [] } }
const registered: TailwindVariaOptions = { components: [] as DefinedComponent[] }
export function cn(...classes: VariaClasses[]): string { return classes.join(' ') }
cn('${cls('row')}', '${cls('row-g-3')}')
cn('${cls('col')}', '${responsive('md', 'col-span-6')}', '${responsive('lg', 'col-span-4')}')
// @ts-expect-error invalid recipe
cn('${cls('col-span-13')}')
// @ts-expect-error unknown responsive modifier
cn('${responsive('tablet', 'col-span-6')}')
// @ts-expect-error atomic utilities are outside the strict contract
cn('${cls('w-full')}')
// @ts-expect-error states are outside the strict contract
cn('${prefix ? `${prefix}:hover:col` : 'hover:col'}')
// @ts-expect-error important modifiers are outside the strict contract
cn('${cls('col')}!')
// @ts-expect-error stacked modifiers are outside the strict contract
cn('${prefix ? `${prefix}:md:hover:col` : 'md:hover:col'}')
// @ts-expect-error arbitrary variants are outside the strict contract
cn('${prefix ? `${prefix}:[&>div]:col` : '[&>div]:col'}')
// @ts-expect-error each argument must be one class
cn('${cls('row')} ${cls('col')}')
`
  await writeFile(join(fixture, 'consumer.ts'), source)
  const typecheck = () => {
    try {
      return execFileSync(process.execPath, [tsc, '--noEmit'], { cwd: fixture, stdio: 'pipe' })
    }
    catch (error) {
      throw new Error(String((error as { stdout: unknown }).stdout))
    }
  }
  return { fixture, path, cls, responsive, typecheck, source }
}

describe('strict typed cn in a downstream pnpm layout', () => {
  it('rejects every class without the project augmentation', async () => {
    const { fixture, typecheck } = await downstream()
    await writeFile(join(fixture, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', strict: true, noEmit: true },
      files: ['consumer.ts'],
    }))
    await writeFile(join(fixture, 'consumer.ts'), `import type { VariaClasses } from 'variacss/types'
export function cn(...classes: VariaClasses[]): string { return classes.join(' ') }
// @ts-expect-error no generated registry means VariaClasses is never
cn('row')
// @ts-expect-error no generated registry means VariaClasses is never
cn('md:col-span-6')
`)
    expect(typecheck).not.toThrow()
  })

  it.each([undefined, 'tw'])('resolves generated responsive types with prefix %s', async (prefix) => {
    const { fixture, typecheck, cls, responsive } = await downstream(prefix)
    expect(typecheck).not.toThrow()
    const css = await adapter.scan(fixture, prefix)
    const selector = (value: string) => `.${value.replaceAll(':', '\\:')}`
    expect(css).toContain(selector(cls('row-g-3')))
    expect(css).toContain(selector(responsive('md', 'col-span-6')))
    expect(css).toContain(selector(responsive('lg', 'col-span-4')))
    expect(css).not.toContain(selector(cls('col-span-12')))
    expect(css).not.toContain(selector(responsive('tablet', 'col-span-6')))
  })

  it('uses configured breakpoint names and removes them after configuration reload', async () => {
    const { fixture, path, typecheck } = await downstream()
    await adapter.register([{ components: [col], manifest: { path }, breakpoints: { wide: '80rem' } }])
    await writeFile(join(fixture, 'consumer.ts'), `import type { VariaClasses } from 'variacss/types'
export function cn(...classes: VariaClasses[]): string { return classes.join(' ') }
cn('col', 'wide:col-span-6')
// @ts-expect-error unconfigured breakpoint
cn('huge:col-span-6')
`)
    expect(typecheck).not.toThrow()
    await adapter.register([{ components: [col], manifest: { path } }])
    await writeFile(join(fixture, 'consumer.ts'), `import type { VariaClasses } from 'variacss/types'
// @ts-expect-error removed breakpoint
const removed: VariaClasses = 'wide:col-span-6'
const valid: VariaClasses = 'md:col-span-6'
`)
    expect(typecheck).not.toThrow()
  })

  it('replaces stale types after recipe reload and rejects the removed class', async () => {
    const { fixture, path, typecheck } = await downstream()
    await adapter.register([{ components: [row], manifest: { path } }])
    await writeFile(join(fixture, 'consumer.ts'), `import type { VariaClasses } from 'variacss/types'
export function cn(...classes: VariaClasses[]): string { return classes.join(' ') }
cn('row', 'md:row-g-3')
// @ts-expect-error removed recipe class
cn('col')
// @ts-expect-error removed responsive recipe class
cn('md:col-span-6')
`)
    expect(typecheck).not.toThrow()
    await writeFile(join(fixture, 'consumer.ts'), `import type { VariaClasses } from 'variacss/types'; const invalid: VariaClasses = 'col';`)
    expect(typecheck).toThrow()
  })
})
