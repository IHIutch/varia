import type {
  ClassInput,
  ComponentConfig,
  ComponentRule,
  DefinedComponent,
  SlotKeyedValue,
  VariantValue,
} from './internal/types.js'

const IDENTIFIER_RE = /^[a-z][a-z0-9-]*$/

const toClassString = (classes: ClassInput): string => Array.isArray(classes) ? classes.join(' ') : classes

export function defineComponent(name: string, config: ComponentConfig): DefinedComponent {
  if (!IDENTIFIER_RE.test(name)) {
    throw new Error(
      `Invalid component name "${name}" — must match /^[a-z][a-z0-9-]*$/ (lowercase + kebab-case, starting with a letter).`,
    )
  }
  if (config.base !== undefined && config.slots !== undefined) {
    throw new Error(
      `Component "${name}" sets both \`base\` and \`slots\` — \`base\` is sugar for \`slots: { root: base }\`. Use one or the other.`,
    )
  }
  // An explicitly-provided `slots: {}` is its own error — the author asked for
  // a slot component and gave it nothing to work with.
  if (config.slots !== undefined && Object.keys(config.slots).length === 0) {
    throw new Error(
      `Component "${name}" has no slots — \`slots\` must declare at least one named part.`,
    )
  }
  // `base: '...'` desugars to `slots: { root: '...' }`.
  const slots = config.base !== undefined ? { root: config.base } : config.slots ?? {}
  const variants = config.variants ?? {}
  if (Object.keys(slots).length === 0 && Object.keys(variants).length === 0) {
    throw new Error(
      `Component "${name}" has no \`base\`/\`slots\` and no \`variants\` — at least one is required.`,
    )
  }

  const rules: ComponentRule[] = []
  const classNames: string[] = []
  const slotNames = new Set(Object.keys(slots))
  // Values each axis accepts in a compound `when`; boolean axes accept `true`.
  const axes = new Map<string, Set<string | true>>()

  const slotClass = (slot: string): string => slot === 'root' ? name : `${name}__${slot}`
  const variantClass = (axis: string, value: string | true): string =>
    value === true ? `${name}-${axis}` : `${name}-${axis}-${value}`

  function addRule(className: string, layer: ComponentRule['layer'], selector: string, classes: ClassInput): void {
    const utilities = toClassString(classes)
    if (utilities.trim() === '') {
      throw new Error(
        `Empty expansion for "${className}" (component "${name}") — variant expansions must contain at least one utility class.`,
      )
    }
    rules.push({ className, layer, selector, utilities })
  }

  for (const [slot, classes] of Object.entries(slots)) {
    if (!IDENTIFIER_RE.test(slot)) {
      throw new Error(
        `Invalid slot name "${slot}" on component "${name}" — slot names must match /^[a-z][a-z0-9-]*$/.`,
      )
    }
    classNames.push(slotClass(slot))
    addRule(slotClass(slot), 'base', '&', classes)
  }

  // A boolean variant is a single value whose class omits the value suffix.
  function addVariant(axis: string, valueKey: string | true, value: VariantValue): void {
    const className = variantClass(axis, valueKey)
    const where = `Variant "${axis}"${valueKey === true ? '' : ` value "${valueKey}"`} on component "${name}"`
    if (!IDENTIFIER_RE.test(className)) {
      throw new Error(
        `Invalid class identifier "${className}" — ${where} must produce class names matching /^[a-z][a-z0-9-]*$/.`,
      )
    }
    classNames.push(className)
    axes.set(axis, (axes.get(axis) ?? new Set()).add(valueKey))

    if (typeof value === 'string' || Array.isArray(value)) {
      addRule(className, 'variants', '&', value)
      return
    }
    if (typeof value !== 'object' || value === null)
      throw new Error(`${where} must be a string, an array of strings, or a slot-keyed object.`)
    const entries = Object.entries(value)
    if (entries.length === 0)
      throw new Error(`${where} has an empty slot map — provide at least one slot expansion.`)
    for (const [slot, classes] of entries) {
      if (!slotNames.has(slot))
        throw new Error(`${where} references slot "${slot}", which is not declared in the component's slots.`)
      if (typeof classes !== 'string' && !(Array.isArray(classes) && classes.every(c => typeof c === 'string')))
        throw new Error(`${where} slot "${slot}" must be a string or an array of strings.`)
      // Root overrides match the activation class without requiring the base.
      addRule(className, 'variants', slot === 'root' ? '&' : `& .${slotClass(slot)}`, classes)
    }
  }

  // String/array definitions and all-slot-key objects are boolean; objects
  // with no slot keys are multi-value. Mixed keys are ambiguous.
  for (const [axis, definition] of Object.entries(variants)) {
    if (typeof definition === 'string' || Array.isArray(definition)) {
      addVariant(axis, true, definition)
      continue
    }
    const isObject = typeof definition === 'object' && definition !== null
    const keys = isObject ? Object.keys(definition) : []
    if (isObject && keys.length === 0) {
      throw new Error(
        `Variant "${axis}" on component "${name}" has no values — every variant must define at least one value.`,
      )
    }
    const slotKeyCount = keys.filter(key => slotNames.has(key)).length
    if (keys.length > 0 && slotKeyCount === keys.length) {
      addVariant(axis, true, definition as SlotKeyedValue)
    }
    else if (keys.length > 0 && slotKeyCount === 0) {
      for (const [valueKey, value] of Object.entries(definition))
        addVariant(axis, valueKey, value)
    }
    else {
      throw new Error(
        `Variant "${axis}" on component "${name}" has an invalid shape. `
        + `It must be either a string/array, an object whose keys are ALL slot names of this component, `
        + `or an object whose keys are ALL multi-value names (none matching a slot name).`,
      )
    }
  }

  for (const { when, class: classes } of config.compoundVariants ?? []) {
    if (!when || typeof when !== 'object') {
      throw new Error(`Compound variant on component "${name}" must have a "when" object.`)
    }
    const conditions = Object.entries(when)
    if (conditions.length === 0) {
      throw new Error(
        `Compound variant on component "${name}" has an empty "when" clause — at least one condition is required.`,
      )
    }
    if (!(typeof classes === 'string' || Array.isArray(classes)) || toClassString(classes).trim() === '') {
      throw new Error(
        `Compound variant on component "${name}" with conditions ${JSON.stringify(when)} has an empty "class" — provide at least one utility class.`,
      )
    }
    for (const [axis, value] of conditions) {
      const values = axes.get(axis)
      if (!values) {
        throw new Error(
          `Compound variant on component "${name}" references variant axis "${axis}", which is not declared. Declared axes: ${[...axes.keys()].join(', ') || '(none)'}.`,
        )
      }
      if (values.has(value))
        continue
      throw new Error(values.has(true)
        ? `Compound variant on component "${name}" sets "${axis}" to "${String(value)}", but "${axis}" is a boolean variant — its value in a compound must be \`true\`.`
        : `Compound variant on component "${name}" sets "${axis}" to "${String(value)}", which is not a declared value. Declared values: ${[...values].join(', ')}.`)
    }
    // The first condition's class activates the rule; the rest must also be
    // present on the same element.
    const [trigger, ...others] = conditions.map(([axis, value]) => variantClass(axis, value))
    addRule(trigger!, 'compounds', `&${others.map(c => `.${c}`).join('')}`, classes)
  }

  return { name, classNames, rules } as DefinedComponent
}
