import type { PluginAPI } from 'tailwindcss/plugin'
import type { DefinedComponent } from './internal/types.js'
import { resolve } from 'node:path'
import { validateComponents } from './internal/validate-components.js'
import { DEFAULT_MANIFEST_PATH, emitManifest, responsiveClasses } from './manifest.js'

export interface TailwindVariaOptions {
  /** Outputs of defineComponent. Generated structures are not extension points. */
  components: DefinedComponent[]
  /** Defaults to node_modules/.varia/manifest.d.ts relative to process cwd. */
  manifest?: false | { path?: string }
  /** Match a CSS prefix(tw), or configure the prefix through this plugin. */
  prefix?: string
}

interface Css { [key: string]: string | Css | Css[] }
interface Registrations { components: DefinedComponent[], manifests: Map<string, string[]> }
const registrations = new WeakMap<object, Registrations>()

/** Register Varia classes with Tailwind v4's public JavaScript plugin interface. */
export function tailwindVaria(options: TailwindVariaOptions): { handler: (api: PluginAPI) => void, config?: { prefix: string } } {
  const { components, manifest = {}, prefix } = options
  validateComponents(components, 'tailwindVaria')
  if (prefix !== undefined && !/^[a-z]+$/.test(prefix))
    throw new Error('tailwindVaria prefix must contain lowercase ASCII letters only.')

  return {
    config: prefix ? { prefix } : undefined,
    handler(api) {
      // Without the layer order, sublayers follow first use and base styles
      // can override variants.
      if (api.theme('--varia') !== 'layers')
        throw new Error('tailwindVaria requires `@import "variacss/tailwind.css";` before `@import "tailwindcss";`.')
      const configuredPrefix = api.config('prefix', '') as string
      const effectivePrefix = prefix ?? configuredPrefix.replace(/-$/, '')
      const apply = (utilities: string): Css => ({
        [`@apply ${utilities.trim().split(/\s+/).map(token =>
          effectivePrefix && !token.startsWith(`${effectivePrefix}:`) ? `${effectivePrefix}:${token}` : token,
        ).join(' ')}`]: {},
      })
      // Attribute selectors avoid depending on Tailwind's registration-time
      // prefix handling.
      const selector = (value: string): string => effectivePrefix
        ? value.replace(/\.([a-z][a-z0-9_-]*)/g, (_, name) => `[class~="${effectivePrefix}:${name}"]`)
        : value

      const config = api.config() as object
      let registered = registrations.get(config)
      if (!registered) {
        registered = { components: [], manifests: new Map() }
        registrations.set(config, registered)
      }
      validateComponents([...registered.components, ...components], 'tailwindVaria')
      registered.components.push(...components)

      const utilities: Record<string, Css[]> = {}
      const append = (name: string, layer: 'base' | 'variants' | 'compounds', css: Css): void => {
        (utilities[`.${name}`] ??= []).push({ [`@layer varia.${layer}`]: css })
      }
      for (const component of components) {
        for (const [name, expansion] of component.shortcuts) {
          const base = name === component.name || name.startsWith(`${component.name}__`)
          append(name, base ? 'base' : 'variants', apply(expansion))
        }
        for (const style of component.styles ?? []) {
          for (const rule of style.rules) {
            append(style.trigger, style.kind === 'compound' ? 'compounds' : 'variants', {
              [selector(rule.selector)]: apply(rule.utilities),
            })
          }
        }
      }
      api.addUtilities(utilities)

      if (manifest !== false) {
        const path = resolve(manifest.path ?? DEFAULT_MANIFEST_PATH)
        const names = registered.manifests.get(path) ?? []
        names.push(...responsiveClasses(
          components.flatMap(component => component.manifest.classNames)
            .map(name => effectivePrefix ? `${effectivePrefix}:${name}` : name),
          Object.keys(api.theme('screens', {}) as Record<string, unknown>),
          effectivePrefix,
        ))
        registered.manifests.set(path, names)
        emitManifest(names, path)
      }
    },
  }
}
