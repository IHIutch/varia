import type { Preflight } from '@unocss/core'
import type {
  DefinedComponent,
  Shortcut,
  SlotComponentConfig,
  SlotKeyedValue,
  SlotVariantValue,
} from './internal/types.js'
import {
  booleanTrueClassName,
  multiValueClassName,
  slotClassName,
} from './internal/naming.js'
import { emitResolvedCSS, resolveUtilities } from './internal/resolve-utilities.js'
import {
  validateAssembledClassName,
  validateComponentName,
  validateExpansion,
} from './internal/validate.js'

export function defineSlotComponent(
  name: string,
  config: SlotComponentConfig,
): DefinedComponent {
  validateComponentName(name)

  const slotNames = Object.keys(config.slots)
  if (slotNames.length === 0) {
    throw new Error(
      `Component "${name}" has no slots — defineSlotComponent requires at least one slot.`,
    )
  }

  const slotNameSet = new Set(slotNames)
  const shortcuts: Shortcut[] = []
  const classNames: string[] = []
  const preflights: Preflight<object>[] = []

  // 1. Emit a shortcut per slot. Root uses bare name; others use BEM.
  for (const [slotName, classes] of Object.entries(config.slots)) {
    validateSlotName(slotName, name)
    const className = slotClassName(name, slotName)
    validateAssembledClassName(className, {
      component: name,
      variantKey: 'slot',
      variantValue: slotName,
      allowBem: true,
    })
    validateExpansion(classes, { className, component: name })
    shortcuts.push([className, classes])
    classNames.push(className)
  }

  // 2. Process variants. Each variant axis is either:
  //    - boolean (string value) — emits one shortcut applied to root
  //    - boolean slot-keyed (object with all-slot-name keys) — emits a preflight
  //    - multi-value (object with non-slot-name keys) — emits a shortcut OR
  //      preflight per value depending on whether the value is string or slot-keyed
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
      })
    }
  }

  return {
    name,
    shortcuts,
    manifest: { name, classNames },
    preflights,
  }
}

// --- internals ---

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
  if (typeof variantDef === 'string')
    return 'boolean-string'
  if (typeof variantDef !== 'object' || variantDef === null) {
    return 'mixed' // surfaces as an error
  }
  const keys = Object.keys(variantDef as Record<string, unknown>)
  if (keys.length === 0)
    return 'mixed' // empty — caller treats as error

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
  variantDef: unknown
  shortcuts: Shortcut[]
  classNames: string[]
  preflights: Preflight<object>[]
}): void {
  const { componentName, slotNames, variantKey, variantDef, shortcuts, classNames, preflights } = args

  const kind = classifyVariant(variantDef, slotNames)

  if (kind === 'mixed') {
    throw new Error(
      `Variant "${variantKey}" on component "${componentName}" has an invalid shape. `
      + `It must be either a string, an object whose keys are ALL slot names of this component, `
      + `or an object whose keys are ALL multi-value names (none matching a slot name).`,
    )
  }

  if (kind === 'boolean-string') {
    // Variant value is a string; applies to root slot only. Emit a shortcut.
    const className = booleanTrueClassName(componentName, variantKey)
    validateAssembledClassName(className, { component: componentName, variantKey })
    validateExpansion(variantDef as string, { className, component: componentName })
    shortcuts.push([className, variantDef as string])
    classNames.push(className)
    return
  }

  if (kind === 'boolean-slot-keyed') {
    // Variant has slot-name keys; emit a preflight that resolves utility
    // strings per slot and emits descendant-selector CSS rules.
    const className = booleanTrueClassName(componentName, variantKey)
    validateAssembledClassName(className, { component: componentName, variantKey })
    classNames.push(className)
    preflights.push(
      slotKeyedVariantPreflight({
        componentName,
        variantClass: className,
        slotKeyedValue: variantDef as SlotKeyedValue,
      }),
    )
    return
  }

  // kind === 'multi-value'
  const values = variantDef as Record<string, SlotVariantValue>
  for (const [valueKey, value] of Object.entries(values)) {
    const className = multiValueClassName(componentName, variantKey, String(valueKey))
    validateAssembledClassName(className, {
      component: componentName,
      variantKey,
      variantValue: String(valueKey),
    })

    if (typeof value === 'string') {
      // String value — applies to root.
      validateExpansion(value, { className, component: componentName })
      shortcuts.push([className, value])
      classNames.push(className)
    }
    else if (typeof value === 'object' && value !== null) {
      // Slot-keyed value — validate keys against slot names, then emit a preflight.
      const slotKeys = Object.keys(value)
      for (const k of slotKeys) {
        if (!slotNames.has(k)) {
          throw new Error(
            `Variant "${variantKey}" value "${valueKey}" on component "${componentName}" `
            + `references slot "${k}", which is not declared in the component's slots.`,
          )
        }
      }
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
        + `must be a string or a slot-keyed object.`,
      )
    }
  }
}

/**
 * Build a UnoCSS preflight that resolves the utility strings for each slot and
 * emits descendant-selector CSS rules. The preflight runs at preset resolution
 * time and has access to the generator via context.
 */
function slotKeyedVariantPreflight(args: {
  componentName: string
  variantClass: string
  slotKeyedValue: SlotKeyedValue
}): Preflight<object> {
  const { componentName, variantClass, slotKeyedValue } = args

  return {
    getCSS: async (context) => {
      // The preflight context exposes the generator.
      const uno = context.generator
      const out: string[] = []

      for (const [slotName, classes] of Object.entries(slotKeyedValue)) {
        if (!classes || classes.trim() === '')
          continue

        const resolved = await resolveUtilities(classes, uno)
        const slotClass = slotClassName(componentName, slotName)
        // Selector: `.variantClass.slotClass` if root, `.variantClass .slotClass` otherwise.
        // The root slot's class IS the component name, so `.card-accent.card`
        // wouldn't match (an element wouldn't have BOTH classes if the consumer
        // wrote them as siblings). Use descendant-selector for non-root, and
        // a chained class selector for root (which means the variant CSS applies
        // when the consumer puts both classes on the same element).
        const selector
          = slotName === 'root'
            ? `.${variantClass}`
            : `.${variantClass} .${slotClass}`

        out.push(emitResolvedCSS(selector, resolved))
      }

      return out.join('\n')
    },
  }
}
