import type { Preflight, Preset } from '@unocss/core'
import type { DefinedComponent } from './internal/types.js'
import { DEFAULT_MANIFEST_PATH, emitManifest } from './manifest.js'

export type PresetVariaOptions = {
  components: DefinedComponent[]
  manifest?: false | { path?: string }
}

export function presetVaria(options: PresetVariaOptions): Preset {
  const { components, manifest = {} } = options

  const seenComponentNames = new Set<string>()
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

    for (const [className, expansion] of component.shortcuts) {
      const existingOwner = shortcutOwner.get(className)
      if (existingOwner !== undefined) {
        throw new Error(
          `Duplicate shortcut "${className}" emitted by both component "${existingOwner}" and component "${component.name}". Each shortcut must come from a single component.`,
        )
      }
      shortcutOwner.set(className, component.name)
      shortcuts.push([className, expansion])
    }

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

  return {
    name: 'varia',
    shortcuts,
    preflights: preflights.length > 0 ? preflights : undefined,
  }
}
