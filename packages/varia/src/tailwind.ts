import type { PluginAPI } from 'tailwindcss/plugin'
import type { DefinedComponent } from './internal/types.js'

export interface TailwindVariaOptions {
  /** Outputs of defineComponent. Generated structures are not extension points. */
  components: DefinedComponent[]
  /** Match a CSS prefix(tw), or configure the prefix through this plugin. */
  prefix?: string
}

interface Css { [key: string]: string | Css | Css[] }
const registrations = new WeakMap<object, DefinedComponent[]>()

/** Check component and class collisions before Tailwind registers rules. */
function validateComponents(components: DefinedComponent[]): void {
  const names = new Set<string>()
  const classes = new Map<string, string>()
  for (const component of components) {
    if (names.has(component.name)) {
      throw new Error(`Duplicate component name "${component.name}" in tailwindVaria. Component names must be unique within an integration.`)
    }
    names.add(component.name)
    for (const className of component.classNames) {
      const owner = classes.get(className)
      if (owner !== undefined)
        throw new Error(`Duplicate class "${className}" emitted by both component "${owner}" and component "${component.name}". Each class name must be unique within an integration.`)
      classes.set(className, component.name)
    }
  }
}

/** Register Varia classes with Tailwind v4's public JavaScript plugin interface. */
export function tailwindVaria(options: TailwindVariaOptions): { handler: (api: PluginAPI) => void, config?: { prefix: string } } {
  const { components, prefix } = options
  validateComponents(components)
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
        registered = []
        registrations.set(config, registered)
      }
      validateComponents([...registered, ...components])
      registered.push(...components)

      const utilities: Record<string, Css[]> = {}
      for (const component of components) {
        for (const rule of component.rules) {
          const css = rule.selector === '&' ? apply(rule.utilities) : { [selector(rule.selector)]: apply(rule.utilities) }
          ;(utilities[`.${rule.className}`] ??= []).push({ [`@layer varia.${rule.layer}`]: css })
        }
      }
      api.addUtilities(utilities)
    },
  }
}
