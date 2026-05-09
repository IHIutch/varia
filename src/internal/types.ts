/**
 * A variant axis maps to either:
 * - a bare string → boolean variant; emits a single `name-key` shortcut
 * - an object of `{ value: expansion }` → multi-value variant; emits `name-key-value`
 */
export type VariantDefinition = string | Record<string, string>

export type ComponentConfig = {
  base?: string
  variants?: Record<string, VariantDefinition>
}

export type Shortcut = [className: string, expansion: string]

export type ComponentManifest = {
  name: string
  classNames: string[]
}

export type DefinedComponent = {
  name: string
  shortcuts: Shortcut[]
  manifest: ComponentManifest
}
