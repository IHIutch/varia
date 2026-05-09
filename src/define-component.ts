import { booleanTrueClassName, multiValueClassName } from './internal/naming.js'
import type {
  ComponentConfig,
  DefinedComponent,
  Shortcut,
  VariantDefinition,
} from './internal/types.js'
import {
  validateAssembledClassName,
  validateComponentName,
  validateExpansion,
} from './internal/validate.js'

type Push = (
  className: string,
  expansion: string,
  context: { variantKey?: string; variantValue?: string },
) => void

function emitVariant(
  componentName: string,
  variantKey: string,
  variantDef: VariantDefinition,
  push: Push,
): void {
  if (typeof variantDef === 'string') {
    push(booleanTrueClassName(componentName, variantKey), variantDef, { variantKey })
    return
  }

  if (Object.keys(variantDef).length === 0) {
    throw new Error(
      `Variant "${variantKey}" on component "${componentName}" has no values — every variant must define at least one value.`,
    )
  }

  for (const [valueKey, expansion] of Object.entries(variantDef)) {
    push(multiValueClassName(componentName, variantKey, String(valueKey)), expansion, {
      variantKey,
      variantValue: String(valueKey),
    })
  }
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
      emitVariant(name, variantKey, variantDef, push)
    }
  }

  return {
    name,
    shortcuts,
    manifest: { name, classNames },
  }
}
