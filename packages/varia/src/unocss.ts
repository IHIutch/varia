import type { Preset, ResolvedConfig, StaticShortcut } from '@unocss/core'
import type { DefinedComponent } from './internal/types.js'
import { resolve } from 'node:path'
import { validateComponents } from './internal/validate-components.js'
import { DEFAULT_MANIFEST_PATH, emitManifest } from './manifest.js'

export interface PresetVariaOptions {
  components: DefinedComponent[]
  manifest?: false | { path?: string }
  /** Match the utility preset's prefix: `tw` here pairs with `prefix: 'tw-'` there. */
  prefix?: string
}

interface Target { selector: string, layer: string }

let nextPresetId = 0

/** Register Varia classes as UnoCSS shortcuts. */
export function presetVaria(options: PresetVariaOptions): Preset {
  const { components, prefix } = options
  validateComponents(components, 'presetVaria')
  if (prefix !== undefined && !/^[a-z]+$/.test(prefix))
    throw new Error('presetVaria prefix must contain lowercase ASCII letters only.')
  const classPrefix = prefix ? `${prefix}-` : ''
  const id = nextPresetId++
  const marker = new RegExp(`^__varia-${id}-(\\d+):`)
  const targets: Target[] = []
  const shortcuts = new Map<string, { layer: string, tokens: string[] }>()
  const tokens = (utilities: string): string[] => utilities.trim().split(/\s+/).map(token => prefixUtility(token, classPrefix))

  for (const component of components) {
    for (const [name, expansion] of component.shortcuts) {
      const base = name === component.name || name.startsWith(`${component.name}__`)
      shortcuts.set(name, { layer: base ? 'varia.base' : 'varia.variants', tokens: tokens(expansion) })
    }
    for (const style of component.styles ?? []) {
      const shortcut = shortcuts.get(style.trigger) ?? { layer: 'varia.variants', tokens: [] }
      shortcuts.set(style.trigger, shortcut)
      for (const rule of style.rules) {
        const index = targets.push({
          selector: rule.selector.replace(/\.([a-z])/g, `.${classPrefix}$1`),
          layer: style.kind === 'compound' ? 'varia.compounds' : 'varia.variants',
        }) - 1
        shortcut.tokens.push(...tokens(rule.utilities).map(token => `__varia-${id}-${index}:${token}`))
      }
    }
  }
  const classIndex = new Map([...shortcuts.keys()].map((name, index) => [`${classPrefix}${name}`, index]))

  return {
    // UnoCSS deduplicates presets by name. Keep separate Varia instances.
    name: `varia:${id}`,
    meta: { varia: options },
    // Between UnoCSS's shortcuts (-10) and ordinary utilities (0).
    layers: { 'varia.base': -9, 'varia.variants': -8, 'varia.compounds': -7 },
    // Register shortcuts under aliases. Otherwise a class such as "first-run"
    // is read as the "first-" variant applied to "run".
    shortcuts: [...shortcuts.values()].map(({ layer, tokens }, index): StaticShortcut => [`__varia-${id}-class-${index}`, tokens, { layer }]),
    variants: [{
      name: `varia-classes:${id}`,
      order: -1_000_000,
      match: (matcher) => {
        const index = classIndex.get(matcher)
        return index === undefined ? undefined : { matcher: `__varia-${id}-class-${index}` }
      },
    }, {
      name: `varia:${id}`,
      match(matcher) {
        const hit = marker.exec(matcher)
        const target = hit && targets[Number(hit[1])]
        if (!target)
          return
        return {
          matcher: matcher.slice(hit[0].length),
          layer: target.layer,
          // Apply first, so states and child selectors from the utility
          // attach to the slot rather than to the activation class.
          order: -1000,
          selector: input => target.selector.replace('&', () => input),
        }
      },
    }],
    configResolved: config => registerAll(config, options),
  }
}

/**
 * Insert the prefix after a utility's variants and modifiers: `hover:-mt-2`
 * becomes `hover:-tw-mt-2`. UnoCSS's preset-level prefix cannot do this for
 * shortcuts, because static rules inside them ignore it.
 */
function prefixUtility(token: string, prefix: string): string {
  if (!prefix)
    return token
  let depth = 0
  let split = -1
  for (let index = 0; index < token.length; index++) {
    const char = token[index]
    if (char === '[' || char === '(')
      depth++
    else if (char === ']' || char === ')')
      depth--
    else if (char === ':' && depth === 0)
      split = index
  }
  const utility = token.slice(split + 1)
  const modifiers = /^[!-]*/.exec(utility)![0]
  return `${token.slice(0, split + 1)}${modifiers}${prefix}${utility.slice(modifiers.length)}`
}

/** Validate and write manifests once per resolved config, across every Varia preset. */
function registerAll(config: ResolvedConfig, options: PresetVariaOptions): void {
  const registered = config.presets.flatMap(preset => preset.meta?.varia ? [preset.meta.varia as PresetVariaOptions] : [])
  if (registered[0] !== options)
    return
  // Layer order alone decides precedence only with CSS cascade layers.
  // Without them, a descendant slot rule outranks a utility on the slot.
  if (!config.outputToCssLayers)
    throw new Error('presetVaria requires `outputToCssLayers: true` in your UnoCSS config.')
  validateComponents(registered.flatMap(entry => entry.components), 'presetVaria')
  const manifests = new Map<string, DefinedComponent[]>()
  for (const { components, manifest = {}, prefix } of registered) {
    if (manifest === false)
      continue
    const path = resolve(manifest.path ?? DEFAULT_MANIFEST_PATH)
    manifests.set(path, [...manifests.get(path) ?? [], ...components.map(component => ({
      ...component,
      manifest: { ...component.manifest, classNames: component.manifest.classNames.map(name => prefix ? `${prefix}-${name}` : name) },
    }))])
  }
  for (const [path, definitions] of manifests)
    emitManifest(definitions, path)
}
