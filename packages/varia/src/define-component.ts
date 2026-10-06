import type { Preflight } from '@unocss/core'
import type {
  ClassInput,
  ComponentConfig,
  CompoundVariantRule,
  CompoundVariantWhen,
  DefinedComponent,
  Shortcut,
  SlotKeyedValue,
  VariantDefinition,
  VariantValue,
} from './internal/types.js'
import type { ComponentPreflight } from './internal/usage.js'
import {
  booleanTrueClassName,
  multiValueClassName,
  slotClassName,
} from './internal/naming.js'
import { emitResolvedCSS, resolveUtilities } from './internal/resolve-utilities.js'
import { usageTrigger } from './internal/usage.js'
import {
  toClassString,
  validateAssembledClassName,
  validateComponentName,
  validateExpansion,
} from './internal/validate.js'

/** Records the kind of each variant axis so compound validation can check it. */
type AxisKind
  = | { kind: 'boolean' }
    | { kind: 'multi-value', values: Set<string> }

export function defineComponent(name: string, config: ComponentConfig): DefinedComponent {
  validateComponentName(name)

  if (config.base !== undefined && config.slots !== undefined) {
    throw new Error(
      `Component "${name}" sets both \`base\` and \`slots\` — \`base\` is sugar for \`slots: { root: base }\`. Use one or the other.`,
    )
  }

  // Normalize: `base: '...'` desugars to `slots: { root: '...' }`. After this
  // step, the rest of the pipeline operates on a uniform slots map.
  const slots: Record<string, ClassInput> | undefined
    = config.base !== undefined
      ? { root: config.base }
      : config.slots

  // An explicitly-provided `slots: {}` is its own error — the author asked for
  // a slot component and gave it nothing to work with.
  if (config.slots !== undefined && Object.keys(config.slots).length === 0) {
    throw new Error(
      `Component "${name}" has no slots — \`slots\` must declare at least one named part.`,
    )
  }

  const hasSlots = slots && Object.keys(slots).length > 0
  const hasVariants = config.variants && Object.keys(config.variants).length > 0
  if (!hasSlots && !hasVariants) {
    throw new Error(
      `Component "${name}" has no \`base\`/\`slots\` and no \`variants\` — at least one is required.`,
    )
  }

  const shortcuts: Shortcut[] = []
  const classNames: string[] = []
  const preflights: Preflight<object>[] = []
  const axisRegistry = new Map<string, AxisKind>()
  const slotNameSet = new Set<string>(slots ? Object.keys(slots) : [])

  // 1. Emit a shortcut per slot. Root uses bare name; others use BEM.
  if (slots) {
    for (const [slotName, classes] of Object.entries(slots)) {
      validateSlotName(slotName, name)
      const className = slotClassName(name, slotName)
      validateAssembledClassName(className, {
        component: name,
        variantKey: 'slot',
        variantValue: slotName,
        allowBem: slotName !== 'root',
      })
      const expansion = toClassString(classes)
      validateExpansion(expansion, { className, component: name })
      shortcuts.push([className, expansion])
      classNames.push(className)
    }
  }

  // 2. Process variants. Classifier disambiguates by inspecting keys against
  //    declared slot names.
  if (config.variants) {
    for (const [variantKey, variantDef] of Object.entries(config.variants)) {
      processVariant({
        componentName: name,
        slotNames: slotNameSet,
        variantKey,
        variantDef,
        shortcuts,
        classNames,
        preflights,
        axisRegistry,
      })
    }
  }

  // 3. Compound variants: cross-axis style descriptors. Validation
  //    runs against the axis registry built above.
  if (config.compoundVariants) {
    for (const compound of config.compoundVariants) {
      validateCompound(name, compound, axisRegistry)
      preflights.push(compoundPreflight(name, compound))
    }
  }

  return {
    name,
    shortcuts,
    manifest: { name, classNames },
    preflights: preflights.length > 0 ? preflights : undefined,
  }
}

// --- slot + variant internals -----------------------------------------------

function validateSlotName(slotName: string, componentName: string): void {
  if (!/^[a-z][a-z0-9-]*$/.test(slotName)) {
    throw new Error(
      `Invalid slot name "${slotName}" on component "${componentName}" — slot names must match /^[a-z][a-z0-9-]*$/.`,
    )
  }
}

function classifyVariant(
  variantDef: unknown,
  slotNames: Set<string>,
): 'boolean-string' | 'boolean-slot-keyed' | 'multi-value' | 'mixed' {
  if (typeof variantDef === 'string' || Array.isArray(variantDef))
    return 'boolean-string'
  if (typeof variantDef !== 'object' || variantDef === null)
    return 'mixed'

  const keys = Object.keys(variantDef as Record<string, unknown>)
  if (keys.length === 0)
    return 'mixed'

  const slotKeyCount = keys.filter(k => slotNames.has(k)).length
  if (slotKeyCount === keys.length)
    return 'boolean-slot-keyed'
  if (slotKeyCount === 0)
    return 'multi-value'
  return 'mixed'
}

function processVariant(args: {
  componentName: string
  slotNames: Set<string>
  variantKey: string
  variantDef: VariantDefinition
  shortcuts: Shortcut[]
  classNames: string[]
  preflights: Preflight<object>[]
  axisRegistry: Map<string, AxisKind>
}): void {
  const {
    componentName,
    slotNames,
    variantKey,
    variantDef,
    shortcuts,
    classNames,
    preflights,
    axisRegistry,
  } = args

  const kind = classifyVariant(variantDef, slotNames)

  if (kind === 'mixed') {
    if (
      typeof variantDef === 'object'
      && variantDef !== null
      && !Array.isArray(variantDef)
      && Object.keys(variantDef).length === 0
    ) {
      throw new Error(
        `Variant "${variantKey}" on component "${componentName}" has no values — every variant must define at least one value.`,
      )
    }
    throw new Error(
      `Variant "${variantKey}" on component "${componentName}" has an invalid shape. `
      + `It must be either a string/array, an object whose keys are ALL slot names of this component, `
      + `or an object whose keys are ALL multi-value names (none matching a slot name).`,
    )
  }

  if (kind === 'boolean-string') {
    const className = booleanTrueClassName(componentName, variantKey)
    validateAssembledClassName(className, { component: componentName, variantKey })
    const expansion = toClassString(variantDef as ClassInput)
    validateExpansion(expansion, { className, component: componentName })
    shortcuts.push([className, expansion])
    classNames.push(className)
    axisRegistry.set(variantKey, { kind: 'boolean' })
    return
  }

  if (kind === 'boolean-slot-keyed') {
    const className = booleanTrueClassName(componentName, variantKey)
    validateAssembledClassName(className, { component: componentName, variantKey })
    validateSlotValue(componentName, variantKey, className, variantDef as SlotKeyedValue)
    classNames.push(className)
    preflights.push(
      slotKeyedVariantPreflight({
        componentName,
        variantClass: className,
        slotKeyedValue: variantDef as SlotKeyedValue,
      }),
    )
    axisRegistry.set(variantKey, { kind: 'boolean' })
    return
  }

  // kind === 'multi-value'
  const values = variantDef as Record<string, VariantValue>
  const valueSet = new Set<string>()
  for (const [valueKey, value] of Object.entries(values)) {
    const className = multiValueClassName(componentName, variantKey, String(valueKey))
    validateAssembledClassName(className, {
      component: componentName,
      variantKey,
      variantValue: String(valueKey),
    })

    if (typeof value === 'string' || Array.isArray(value)) {
      const expansion = toClassString(value)
      validateExpansion(expansion, { className, component: componentName })
      shortcuts.push([className, expansion])
      classNames.push(className)
    }
    else if (typeof value === 'object' && value !== null) {
      const slotKeys = Object.keys(value)
      for (const k of slotKeys) {
        if (!slotNames.has(k)) {
          throw new Error(
            `Variant "${variantKey}" value "${valueKey}" on component "${componentName}" `
            + `references slot "${k}", which is not declared in the component's slots.`,
          )
        }
      }
      validateSlotValue(componentName, variantKey, className, value, valueKey)
      classNames.push(className)
      preflights.push(
        slotKeyedVariantPreflight({
          componentName,
          variantClass: className,
          slotKeyedValue: value,
        }),
      )
    }
    else {
      throw new Error(
        `Variant "${variantKey}" value "${valueKey}" on component "${componentName}" `
        + `must be a string, an array of strings, or a slot-keyed object.`,
      )
    }
    valueSet.add(String(valueKey))
  }
  axisRegistry.set(variantKey, { kind: 'multi-value', values: valueSet })
}

function validateSlotValue(
  componentName: string,
  variantKey: string,
  className: string,
  value: SlotKeyedValue,
  valueKey?: string,
): void {
  const where = `Variant "${variantKey}"${valueKey === undefined ? '' : ` value "${valueKey}"`} on component "${componentName}"`
  if (Object.keys(value).length === 0)
    throw new Error(`${where} has an empty slot map — provide at least one slot expansion.`)
  for (const [slot, classes] of Object.entries(value)) {
    if (typeof classes !== 'string' && !(Array.isArray(classes) && classes.every(c => typeof c === 'string'))) {
      throw new Error(`${where} slot "${slot}" must be a string or an array of strings.`)
    }
    validateExpansion(toClassString(classes), { className, component: componentName })
  }
}

/**
 * Build a style descriptor that resolves each slot's utilities and emits
 * descendant-selector CSS. presetVaria activates it through the variant class
 * and resolves utilities against the current generator.
 */
function slotKeyedVariantPreflight(args: {
  componentName: string
  variantClass: string
  slotKeyedValue: SlotKeyedValue
}): ComponentPreflight {
  const { componentName, variantClass, slotKeyedValue } = args

  return {
    [usageTrigger]: variantClass,
    getCSS: async (context) => {
      const uno = context.generator
      const out: string[] = []

      for (const [slotName, rawClasses] of Object.entries(slotKeyedValue)) {
        const classes = toClassString(rawClasses)
        if (!classes || classes.trim() === '')
          continue

        const resolved = await resolveUtilities(classes, uno)
        const slotClass = slotClassName(componentName, slotName)
        // Repeat the root variant class to beat its base shortcut without
        // requiring the base class. Non-root slots already have two classes.
        const selector
          = slotName === 'root'
            ? `.${variantClass}.${variantClass}`
            : `.${variantClass} .${slotClass}`

        out.push(emitResolvedCSS(selector, resolved))
      }

      return out.join('\n')
    },
  }
}

// --- compound internals -----------------------------------------------------

function validateCompound(
  componentName: string,
  compound: CompoundVariantRule,
  axisRegistry: Map<string, AxisKind>,
): void {
  const { when, class: classes } = compound

  if (!when || typeof when !== 'object') {
    throw new Error(
      `Compound variant on component "${componentName}" must have a "when" object.`,
    )
  }
  const whenKeys = Object.keys(when)
  if (whenKeys.length === 0) {
    throw new Error(
      `Compound variant on component "${componentName}" has an empty "when" clause — at least one condition is required.`,
    )
  }

  const classesIsValid
    = (typeof classes === 'string' && classes.trim() !== '')
      || (Array.isArray(classes) && toClassString(classes).trim() !== '')
  if (!classesIsValid) {
    throw new Error(
      `Compound variant on component "${componentName}" with conditions ${JSON.stringify(
        when,
      )} has an empty "class" — provide at least one utility class.`,
    )
  }

  for (const [axis, value] of Object.entries(when)) {
    const axisInfo = axisRegistry.get(axis)
    if (!axisInfo) {
      throw new Error(
        `Compound variant on component "${componentName}" references variant axis "${axis}", which is not declared. Declared axes: ${[
          ...axisRegistry.keys(),
        ].join(', ') || '(none)'}.`,
      )
    }

    if (axisInfo.kind === 'boolean') {
      if (value !== true) {
        throw new Error(
          `Compound variant on component "${componentName}" sets "${axis}" to "${String(
            value,
          )}", but "${axis}" is a boolean variant — its value in a compound must be \`true\`.`,
        )
      }
    }
    else {
      // multi-value
      if (typeof value !== 'string' || !axisInfo.values.has(value)) {
        throw new Error(
          `Compound variant on component "${componentName}" sets "${axis}" to "${String(
            value,
          )}", which is not a declared value. Declared values: ${[
            ...axisInfo.values,
          ].join(', ')}.`,
        )
      }
    }
  }
}

function compoundSelector(componentName: string, when: CompoundVariantWhen): string {
  // Build a chained-class selector: `.btn-s-xs.btn-square`.
  // Multi-value axis with value V → `.componentName-axis-V`.
  // Boolean axis with value `true` → `.componentName-axis`.
  const classes = Object.entries(when).map(([axis, value]) => {
    if (value === true) {
      return `.${booleanTrueClassName(componentName, axis)}`
    }
    return `.${multiValueClassName(componentName, axis, String(value))}`
  })
  // A one-condition compound must also outrank its ordinary variant shortcut.
  return classes.length === 1 ? classes[0]! + classes[0]! : classes.join('')
}

function compoundPreflight(
  componentName: string,
  compound: CompoundVariantRule,
): ComponentPreflight {
  const selector = compoundSelector(componentName, compound.when)
  const classes = toClassString(compound.class)
  const [axis, value] = Object.entries(compound.when)[0]!
  const trigger = value === true
    ? booleanTrueClassName(componentName, axis)
    : multiValueClassName(componentName, axis, value)
  return {
    [usageTrigger]: trigger,
    getCSS: async (context) => {
      const uno = context.generator
      const resolved = await resolveUtilities(classes, uno)
      return emitResolvedCSS(selector, resolved)
    },
  }
}
