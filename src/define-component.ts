import type { Preflight } from '@unocss/core'
import type {
  ComponentConfig,
  CompoundVariantRule,
  CompoundVariantWhen,
  DefinedComponent,
  Shortcut,
  VariantDefinition,
} from './internal/types.js'
import { booleanTrueClassName, multiValueClassName } from './internal/naming.js'
import { emitResolvedCSS, resolveUtilities } from './internal/resolve-utilities.js'
import {
  validateAssembledClassName,
  validateComponentName,
  validateExpansion,
} from './internal/validate.js'

type Push = (
  className: string,
  expansion: string,
  context: { variantKey?: string, variantValue?: string },
) => void

/** Records the kind of each variant axis so compound validation can check it. */
type AxisKind
  = | { kind: 'boolean' }
    | { kind: 'multi-value', values: Set<string> }

function emitVariant(
  componentName: string,
  variantKey: string,
  variantDef: VariantDefinition,
  push: Push,
  axisRegistry: Map<string, AxisKind>,
): void {
  if (typeof variantDef === 'string') {
    push(booleanTrueClassName(componentName, variantKey), variantDef, { variantKey })
    axisRegistry.set(variantKey, { kind: 'boolean' })
    return
  }

  if (Object.keys(variantDef).length === 0) {
    throw new Error(
      `Variant "${variantKey}" on component "${componentName}" has no values — every variant must define at least one value.`,
    )
  }

  const values = new Set<string>()
  for (const [valueKey, expansion] of Object.entries(variantDef)) {
    push(multiValueClassName(componentName, variantKey, String(valueKey)), expansion, {
      variantKey,
      variantValue: String(valueKey),
    })
    values.add(String(valueKey))
  }
  axisRegistry.set(variantKey, { kind: 'multi-value', values })
}

export function defineComponent(name: string, config: ComponentConfig): DefinedComponent {
  validateComponentName(name)

  const hasVariants = config.variants && Object.keys(config.variants).length > 0
  if (config.base === undefined && !hasVariants) {
    throw new Error(
      `Component "${name}" has no \`base\` and no \`variants\` — at least one is required.`,
    )
  }

  const shortcuts: Shortcut[] = []
  const classNames: string[] = []
  const preflights: Preflight<object>[] = []
  const axisRegistry = new Map<string, AxisKind>()

  const push: Push = (className, expansion, context) => {
    validateAssembledClassName(className, { component: name, ...context })
    validateExpansion(expansion, { className, component: name })
    shortcuts.push([className, expansion])
    classNames.push(className)
  }

  if (config.base !== undefined) {
    push(name, config.base, {})
  }

  if (config.variants) {
    for (const [variantKey, variantDef] of Object.entries(config.variants)) {
      emitVariant(name, variantKey, variantDef, push, axisRegistry)
    }
  }

  // Compound variants: cross-axis rules that emit combined-selector CSS via
  // preflights. Validation runs against the axis registry built above; the
  // preflight's getCSS uses the utility resolver at preset resolution time.
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

// --- compound internals ---

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

  if (typeof classes !== 'string' || classes.trim() === '') {
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
  return classes.join('')
}

function compoundPreflight(
  componentName: string,
  compound: CompoundVariantRule,
): Preflight<object> {
  const selector = compoundSelector(componentName, compound.when)
  return {
    getCSS: async (context) => {
      const uno = context.generator
      const resolved = await resolveUtilities(compound.class, uno)
      return emitResolvedCSS(selector, resolved)
    },
  }
}
