import type { Preflight } from '@unocss/core'

/**
 * A variant's value can be a single utility-class string (applied to the
 * default slot, or to the component itself for single-element components),
 * or — for slot components only — a record mapping slot names to utility
 * class strings.
 */
export type VariantDefinition = string | Record<string, string>

/**
 * A compound variant's `when` clause: which variant axis values must be set
 * together for the compound's CSS to apply. Multi-value axes use their value
 * name (e.g., `s: 'xs'`); boolean axes use `true`.
 */
export type CompoundVariantWhen = Record<string, string | true>

export type CompoundVariantRule = {
  /** Conditions: every key/value must be present on the same element. */
  when: CompoundVariantWhen
  /** Utility class string applied when the conditions match. */
  class: string
}

export type ComponentConfig = {
  base?: string
  variants?: Record<string, VariantDefinition>
  /**
   * Cross-axis rules. Each compound emits a CSS rule with a combined-class
   * selector built from the `when` keys. See ADR-0002 for the design.
   */
  compoundVariants?: CompoundVariantRule[]
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
  /**
   * UnoCSS preflights contributed by this component. Used by `defineSlotComponent`
   * to emit descendant-selector CSS rules for slot-keyed variants, where the
   * variant CSS resolves utility strings at preset construction time.
   * Single-element `defineComponent` doesn't populate this.
   */
  preflights?: Preflight<object>[]
}

// --- Slot component types ----------------------------------------------------

/**
 * A slot variant value targets specific slots:
 *
 *   variant: { primary: { root: 'bg-blue-600', title: 'text-white' } }
 *
 * Each key is a slot name from the component's `slots` config; each value is
 * a utility class string that gets resolved and applied to that slot via
 * a descendant selector.
 */
export type SlotKeyedValue = Record<string, string>

/**
 * For a multi-value variant on a slot component, each value can be either:
 * - a flat string (applied to the root slot only), or
 * - a slot-keyed object.
 */
export type SlotVariantValue = string | SlotKeyedValue

/**
 * A slot variant definition has four shapes:
 *
 * 1. `'string'` — boolean variant; applies to root.
 * 2. `{ slot: 'string', slot2: 'string', ... }` — boolean slot-keyed (all keys
 *    are slot names of the component).
 * 3. `{ valueName: 'string', valueName2: 'string', ... }` — multi-value with
 *    string values (each applies to root).
 * 4. `{ valueName: { slot: 'string', ... }, ... }` — multi-value with
 *    slot-keyed values.
 *
 * Shapes 2 and 3 are disambiguated by inspecting the keys against the
 * component's slot list. Mixed-key configs (some slot names, some not) throw
 * at validation time.
 */
export type SlotVariantDefinition =
  | string
  | Record<string, SlotVariantValue>

export type SlotComponentConfig = {
  /**
   * Named parts of the component. Keys are slot names (must match the
   * assembled-class regex `/^[a-z][a-z0-9-]*$/`). The `root` slot maps to the
   * bare component name (e.g., `card`); every other slot maps to BEM
   * `component__slot` (e.g., `card__title`).
   */
  slots: Record<string, string>
  variants?: Record<string, SlotVariantDefinition>
}
