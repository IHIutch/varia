import type { Preflight, PreflightContext, Preset } from '@unocss/core'
import type { DefinedComponent } from './internal/types.js'
import { DEFAULT_MANIFEST_PATH, emitManifest } from './manifest.js'

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

    shortcuts.push(...component.shortcuts)

    // Slot components contribute preflights for slot-keyed variants
    // (descendant-selector CSS rules resolved at preset resolution time).
    if (component.preflights) {
      preflights.push(...component.preflights)
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

  return {
    name: 'varia',
    shortcuts,
    preflights: preflights.length > 0
      ? preflights.map((preflight, index) => ({
          ...preflight,
          getCSS: async context => (await prepare(context))[index],
        }))
      : undefined,
    configResolved: preflights.length > 0
      ? (config) => {
          config.preflights = config.preflights.map(preflight => ({
            ...preflight,
            getCSS: async (context) => {
              await prepare(context)
              return preflight.getCSS(context)
            },
          }))
        }
      : undefined,
  }
}
