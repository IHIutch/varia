/**
 * Anywhere a utility-class string is accepted, an array of strings is also
 * accepted and joined with a single space. Lets authors break long class
 * lists across lines without `.join(' ')` ceremony.
 */
export type ClassInput = string | string[]

/**
 * A variant value targeting one or more slots:
 *
 *   accent: { root: 'ring-2', title: 'text-blue-900' }
 *
 * Keys must all be declared slot names of the component. Values get resolved
 * and applied to each slot via a descendant selector.
 */
export type SlotKeyedValue = Record<string, ClassInput>

/**
 * For a multi-value variant, each value can be either:
 * - a flat ClassInput (applied to the root slot), or
 * - a slot-keyed object (applied to specific slots).
 */
export type VariantValue = ClassInput | SlotKeyedValue

/**
 * A variant definition has four shapes:
 *
 * 1. `'string' | string[]` — boolean variant, applied to root.
 * 2. `{ slot: '...', slot2: '...' }` — boolean slot-keyed; ALL keys must be
 *    declared slot names of the component.
 * 3. `{ valueName: '...', valueName2: '...' }` — multi-value; each value
 *    applies to root.
 * 4. `{ valueName: { slot: '...', ... }, ... }` — multi-value with slot-keyed
 *    values.
 *
 * Shapes 2 and 3 are disambiguated by inspecting the keys against the
 * component's slots. Mixed-key configs (some slot names, some not) throw at
 * validation time. For single-slot components (the `base`-only shape), no
 * slot collisions are possible unless a variant value object literally uses
 * a key named `root`.
 */
export type VariantDefinition
  = | ClassInput
    | Record<string, VariantValue>

/**
 * A compound variant's `when` clause: which variant axis values must be set
 * together for the compound's CSS to apply. Multi-value axes use their value
 * name (e.g., `s: 'xs'`); boolean axes use `true`.
 */
export type CompoundVariantWhen = Record<string, string | true>

export interface CompoundVariantRule {
  /**
   * Conditions on the same element. The first key activates CSS generation and
   * accepts usage-site modifiers; remaining conditions match bare variant classes.
   */
  when: CompoundVariantWhen
  /** Utility class string applied when the conditions match. */
  class: ClassInput
}

export interface ComponentConfig {
  /**
   * Utility classes for the bare component. Sugar for `slots: { root: base }`.
   * Mutually exclusive with `slots`.
   */
  base?: ClassInput
  /**
   * Named parts of a multi-element component. The `root` slot maps to the
   * bare component name; every other slot maps to BEM `component__slot`.
   * Slot names must match `/^[a-z][a-z0-9-]*$/`.
   */
  slots?: Record<string, ClassInput>
  variants?: Record<string, VariantDefinition>
  /**
   * Cross-axis rules. Each compound emits a CSS rule with a combined-class
   * selector built from the `when` keys in insertion order.
   */
  compoundVariants?: CompoundVariantRule[]
}

export type Shortcut = [className: string, expansion: string]

/** Utility strings and selectors relative to an activation class. */
export interface ComponentStyle {
  trigger: string
  kind: 'slot' | 'compound'
  rules: { selector: string, utilities: string }[]
}

/**
 * Factory output for tailwindVaria. Pass through unchanged; its generated
 * members are implementation details, not a supported authoring interface.
 */
export interface DefinedComponent {
  /**
   * Factory marker shared by source and built declarations. It has no runtime
   * representation and must not be used for runtime validation.
   * @internal
   */
  readonly __variaDefinition: 'DefinedComponent'
  /** @internal */
  name: string
  /** @internal */
  shortcuts: Shortcut[]
  /** @internal */
  classNames: string[]
  /**
   * Slot and compound styles, resolved by Tailwind on demand.
   * @internal
   */
  styles?: ComponentStyle[]
}
