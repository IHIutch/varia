import type { Preflight, PreflightContext, Preset, ResolvedConfig, Rule } from '@unocss/core'
import type { DefinedComponent } from './internal/types.js'
import type { ComponentPreflight } from './internal/usage.js'
import { resolve } from 'node:path'
import { usageTrigger } from './internal/usage.js'
import { DEFAULT_MANIFEST_PATH, emitManifest } from './manifest.js'

let nextPresetId = 0
const componentPreflight = Symbol('varia component preflight')
const manifestRegistrations = new WeakMap<NonNullable<Preset['configResolved']>, { components: DefinedComponent[], path: string }>()
const emittedConfigs = new WeakSet<ResolvedConfig>()

function emitResolvedManifests(config: ResolvedConfig): void {
  if (emittedConfigs.has(config))
    return
  const byPath = new Map<string, DefinedComponent[]>()
  for (const preset of config.presets) {
    const registration = preset.configResolved && manifestRegistrations.get(preset.configResolved)
    if (!registration)
      continue
    const path = resolve(registration.path)
    const components = byPath.get(path) ?? []
    components.push(...registration.components)
    byPath.set(path, components)
  }
  for (const [path, components] of byPath)
    emitManifest(components, path)
  emittedConfigs.add(config)
}

export interface PresetVariaOptions {
  components: DefinedComponent[]
  manifest?: false | { path?: string }
}

export function presetVaria(options: PresetVariaOptions): Preset {
  const { components, manifest = {} } = options

  const seenComponentNames = new Set<string>()
  const classOwner = new Map<string, string>()
  const shortcutOwner = new Map<string, string>()
  const shortcuts: [string, string][] = []
  const preflights: Preflight<object>[] = []
  const onDemand: { trigger: string, style: Preflight<object> }[] = []

  for (const component of components) {
    if (seenComponentNames.has(component.name)) {
      throw new Error(
        `Duplicate component name "${component.name}" in presetVaria. Component names must be unique within a preset.`,
      )
    }
    seenComponentNames.add(component.name)

    for (const [className] of component.shortcuts) {
      const owner = shortcutOwner.get(className)
      if (owner !== undefined) {
        throw new Error(
          `Duplicate shortcut "${className}" emitted by both component "${owner}" and component "${component.name}". Each shortcut must come from a single component.`,
        )
      }
      shortcutOwner.set(className, component.name)
    }

    for (const className of component.manifest.classNames) {
      const owner = classOwner.get(className)
      if (owner !== undefined) {
        throw new Error(
          `Duplicate class "${className}" emitted by both component "${owner}" and component "${component.name}". Each class name must be unique within a preset.`,
        )
      }
      classOwner.set(className, component.name)
    }

    shortcuts.push(...component.shortcuts.map(([className, expansion]): [string, string] => [className, expansion]))

    // Generated style descriptors carry an activation class. Ordinary
    // user-authored preflights keep their unconditional behavior.
    if (component.preflights) {
      for (const preflight of component.preflights) {
        const trigger = (preflight as Partial<ComponentPreflight>)[usageTrigger]
        if (trigger === undefined) {
          preflights.push(preflight)
          continue
        }
        onDemand.push({ trigger, style: preflight })
      }
    }
  }

  if (manifest !== false) {
    const path = manifest.path ?? DEFAULT_MANIFEST_PATH
    emitManifest(components, path)
  }

  // Each generate() call supplies one context object to all preflights.
  // Prepare our utility dependencies once for that context, before any preset
  // or user preflight reads theme/property tracking. Do not safelist utilities:
  // that would also emit unwanted atomic classes alongside the component CSS.
  const prepared = new WeakMap<PreflightContext<object>, Promise<(string | undefined)[]>>()
  const prepare = (context: PreflightContext<object>): Promise<(string | undefined)[]> => {
    let pending = prepared.get(context)
    if (!pending) {
      pending = Promise.all(preflights.map(preflight => preflight.getCSS(context)))
      prepared.set(context, pending)
    }
    return pending
  }

  const presetId = nextPresetId++
  for (const [index, { trigger }] of onDemand.entries()) {
    const utility = `__varia-${presetId}-style-${index}`
    const shortcut = shortcuts.find(([name]) => name === trigger)
    if (shortcut)
      shortcut[1] += ` ${utility}`
    else
      shortcuts.push([trigger, utility])
  }
  // Internal raw-CSS utilities are expanded only by an active shortcut. Their
  // dependencies resolve before UnoCSS emits theme/property preflights.
  const rules: Rule[] = onDemand.map(({ style }, index) => [
    new RegExp(`^__varia-${presetId}-style-${index}$`),
    async (_, context) => await style.getCSS(context) || undefined,
    { internal: true, layer: 'shortcuts' },
  ])

  // Protect exact component class names from utility variant prefixes such as
  // "first-". The original raw selector remains the emitted CSS selector.
  const aliases = new Map(shortcuts.map(([name], index) => [name, `__varia-${presetId}-class-${index}`]))

  const preset: Preset = {
    // UnoCSS deduplicates presets by name. Keep separate Varia instances.
    name: `varia:${presetId}`,
    shortcuts: rules.length === 0
      ? shortcuts
      : [
          ...shortcuts,
          [new RegExp(`^__varia-${presetId}-class-(\\d+)$`), ([, index]) => shortcuts[Number(index)]?.[1]],
        ],
    variants: rules.length === 0
      ? undefined
      : [{
          name: `varia-classes:${presetId}`,
          order: -1000000,
          match: (matcher) => {
            const alias = aliases.get(matcher)
            return alias === undefined ? undefined : { matcher: alias }
          },
        }],
    rules,
    preflights: preflights.length > 0
      ? preflights.map((preflight, index) => ({
          ...preflight,
          [componentPreflight]: true,
          getCSS: async context => (await prepare(context))[index],
        }))
      : undefined,
    configResolved: (config) => {
      emitResolvedManifests(config)
      // UnoCSS shallow-copies presets. Keep metadata private to this resolved
      // configuration so another generator cannot move cached rules' layers.
      const replacements = new Map<Rule, Rule>()
      for (const rule of rules)
        replacements.set(rule, [rule[0], rule[1], { ...rule[2], layer: config.shortcutsLayer }] as Rule)
      config.rules = config.rules.map(rule => replacements.get(rule) ?? rule)
      config.rulesDynamic = config.rulesDynamic.map(rule => (replacements.get(rule) ?? rule) as typeof rule)
      if (preflights.length > 0) {
        config.preflights = config.preflights.map(preflight => ({
          ...preflight,
          layer: (preflight as Preflight & { [componentPreflight]?: boolean })[componentPreflight]
            ? config.shortcutsLayer
            : preflight.layer,
          getCSS: async (context) => {
            await prepare(context)
            return preflight.getCSS(context)
          },
        }))
      }
    },
  }
  if (manifest !== false)
    manifestRegistrations.set(preset.configResolved!, { components, path: manifest.path ?? DEFAULT_MANIFEST_PATH })
  return preset
}
