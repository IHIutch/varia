import type { Preset, ResolvedConfig, StaticShortcut } from '@unocss/core'
import type { DefinedComponent } from './internal/types.js'
import { resolve } from 'node:path'
import { expandVariantGroup } from '@unocss/core'
import { validateComponents } from './internal/validate-components.js'
import { DEFAULT_MANIFEST_PATH, emitManifest } from './manifest.js'

export interface PresetVariaOptions {
  components: DefinedComponent[]
  manifest?: false | { path?: string }
}

interface Target { selector: string, layer: string }

let nextPresetId = 0

/** Register Varia classes as UnoCSS shortcuts. */
export function presetVaria(options: PresetVariaOptions): Preset {
  validateComponents(options.components, 'presetVaria')
  const id = nextPresetId++
  const marker = new RegExp(`^__varia-${id}-(\\d+):`)
  const targets: Target[] = []
  const shortcuts = new Map<string, { layer: string, tokens: string[] }>()
  const tokens = (utilities: string): string[] => expandVariantGroup(utilities.trim()).split(/\s+/).filter(Boolean)

  for (const component of options.components) {
    for (const [name, expansion] of component.shortcuts) {
      const base = name === component.name || name.startsWith(`${component.name}__`)
      shortcuts.set(name, { layer: base ? 'varia-base' : 'varia-variants', tokens: tokens(expansion) })
    }
    for (const style of component.styles ?? []) {
      const shortcut = shortcuts.get(style.trigger) ?? { layer: 'varia-variants', tokens: [] }
      shortcuts.set(style.trigger, shortcut)
      for (const rule of style.rules) {
        const index = targets.push({ selector: rule.selector, layer: style.kind === 'compound' ? 'varia-compounds' : 'varia-variants' }) - 1
        shortcut.tokens.push(...tokens(rule.utilities).map(token => `__varia-${id}-${index}:${token}`))
      }
    }
  }
  const classIndex = new Map([...shortcuts.keys()].map((name, index) => [name, index]))

  return {
    // UnoCSS deduplicates presets by name. Keep separate Varia instances.
    name: `varia:${id}`,
    meta: { varia: options },
    // Between UnoCSS's shortcuts (-10) and ordinary utilities (0).
    layers: { 'varia-base': -9, 'varia-variants': -8, 'varia-compounds': -7 },
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

/** Validate and write manifests once per resolved config, across every Varia preset. */
function registerAll(config: ResolvedConfig, options: PresetVariaOptions): void {
  const registered = config.presets.flatMap(preset => preset.meta?.varia ? [preset.meta.varia as PresetVariaOptions] : [])
  if (registered[0] !== options)
    return
  validateComponents(registered.flatMap(entry => entry.components), 'presetVaria')
  const manifests = new Map<string, DefinedComponent[]>()
  for (const { components, manifest = {} } of registered) {
    if (manifest === false)
      continue
    const path = resolve(manifest.path ?? DEFAULT_MANIFEST_PATH)
    manifests.set(path, [...manifests.get(path) ?? [], ...components])
  }
  for (const [path, components] of manifests)
    emitManifest(components, path)
}
