import type { DefinedComponent } from '../src/index.js'
import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import transformerDirectives from '@unocss/transformer-directives'
import MagicString from 'magic-string'
import { compile } from 'tailwindcss'
import { vi } from 'vitest'
import { tailwindVaria } from '../src/tailwind.js'
import { presetVaria } from '../src/unocss.js'
import { flatten, layers, theme } from './_tailwind.js'

export interface Registration {
  components: DefinedComponent[]
  manifest?: false | { path: string }
  prefix?: string
}

export interface GenerateOptions {
  prefix?: string
  /** Add a `brand` color, a 50rem `md` breakpoint, and a `custom` utility. */
  custom?: boolean
}

/** One CSS engine behind the shared contract. */
export interface Adapter {
  name: string
  generate: (components: DefinedComponent[], classes: string[], options?: GenerateOptions) => Promise<string>
  /** Compile user CSS that applies component classes. */
  apply: (components: DefinedComponent[], css: string) => Promise<string>
  /** Resolve a config containing these registrations, as a build or reload would. */
  register: (registrations: Registration[]) => Promise<unknown>
  /** Resolve a config that skips the adapter's required precedence setup. */
  registerWithoutLayers: (components: DefinedComponent[]) => Promise<unknown>
  important: (name: string) => string
  /** How markup, activation selectors, and other selectors spell a prefixed class. */
  prefixed: (prefix: string) => { cls: (name: string) => string, activation: (name: string) => string, other: (name: string) => string }
}

function tailwindCss(plugins: number, extra = ''): string {
  return `${layers}\n${theme}\n${extra}\n${Array.from({ length: plugins }, (_, index) => `@plugin "${index}";`).join('\n')}\n@layer utilities { @tailwind utilities; }`
}

async function tailwindCompile(registrations: Registration[], extra = '', css = tailwindCss(registrations.length, extra)): ReturnType<typeof compile> {
  return compile(css, {
    loadModule: async (id, base) => ({ path: '', base, module: tailwindVaria({ manifest: false, ...registrations[Number(id)]! }) }),
  })
}

export const tailwind: Adapter = {
  name: 'tailwind',
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

async function unoGenerator(registrations: Registration[], { prefix, custom }: GenerateOptions = {}, outputToCssLayers = true): ReturnType<typeof createGenerator> {
  return createGenerator({
    outputToCssLayers,
    presets: [
      presetWind4({ preflights: { reset: false }, prefix: prefix ? `${prefix}-` : undefined }),
      ...registrations.map(registration => presetVaria({ manifest: false, ...registration })),
    ],
    ...custom
      ? { theme: { colors: { brand: '#123456' }, breakpoint: { md: '50rem' } }, rules: [['custom', { 'text-decoration': 'underline' }]] }
      : {},
  })
}

export const unocss: Adapter = {
  name: 'unocss',
  async generate(components, classes, options = {}) {
    // UnoCSS only warns about utilities it cannot resolve; Tailwind throws.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const uno = await unoGenerator([{ components, prefix: options.prefix }], options)
      const { css } = await uno.generate(classes.join(' '), { preflights: true })
      const unmatched = warn.mock.calls.map(args => String(args[0])).filter(message => message.includes('unmatched utility'))
      if (unmatched.length)
        throw new Error(unmatched.join('\n'))
      return css
    }
    finally {
      warn.mockRestore()
    }
  },
  async apply(components, css) {
    const uno = await unoGenerator([{ components }])
    const code = new MagicString(css)
    await transformerDirectives().transform(code, 'input.css', { uno } as never)
    return code.toString()
  },
  register: registrations => unoGenerator(registrations),
  registerWithoutLayers: components => unoGenerator([{ components }], {}, false),
  important: name => `!${name}`,
  prefixed: prefix => ({
    cls: name => `${prefix}-${name}`,
    activation: name => `.${prefix}-${name}`,
    other: name => `.${prefix}-${name}`,
  }),
}

export const adapters = [tailwind, unocss]
