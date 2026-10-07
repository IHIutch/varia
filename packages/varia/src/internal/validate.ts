import type { ClassInput } from './types.js'

const CLASS_NAME_RE = /^[a-z][a-z0-9-]*$/

export function validateComponentName(name: string): void {
  if (!CLASS_NAME_RE.test(name)) {
    throw new Error(
      `Invalid component name "${name}" — must match /^[a-z][a-z0-9-]*$/ (lowercase + kebab-case, starting with a letter).`,
    )
  }
}

export function validateAssembledClassName(
  className: string,
  context: {
    component: string
    variantKey?: string
    variantValue?: string
  },
): void {
  if (CLASS_NAME_RE.test(className))
    return

  const where = context.variantKey
    ? ` (component "${context.component}", variant "${context.variantKey}"${
      context.variantValue !== undefined ? `, value "${context.variantValue}"` : ''
    })`
    : ` (component "${context.component}")`

  throw new Error(
    `Invalid class identifier "${className}"${where} — class names must match /^[a-z][a-z0-9-]*$/.`,
  )
}

export function toClassString(input: ClassInput): string {
  return Array.isArray(input) ? input.join(' ') : input
}

export function validateExpansion(
  expansion: string,
  context: { className: string, component: string },
): void {
  if (expansion.trim().length === 0) {
    throw new Error(
      `Empty expansion for "${context.className}" (component "${context.component}") — variant expansions must contain at least one utility class.`,
    )
  }
  // Tailwind has no variant groups. Rejecting them keeps definitions portable.
  let bracketDepth = 0
  let quote: string | undefined
  let hasVariantGroup = false
  for (let index = 0; index < expansion.length; index++) {
    const char = expansion[index]
    if (char === '\\') {
      index++
      continue
    }
    if (quote) {
      if (char === quote)
        quote = undefined
      continue
    }
    if (bracketDepth > 0 && (char === '"' || char === '\''))
      quote = char
    else if (char === '[')
      bracketDepth++
    else if (char === ']')
      bracketDepth--
    else if (char === ':' && expansion[index + 1] === '(' && bracketDepth === 0)
      hasVariantGroup = true
  }
  if (hasVariantGroup) {
    throw new Error(
      `Variant group in "${context.className}" (component "${context.component}") — write each utility with its own variant, such as "hover:a hover:b" instead of "hover:(a b)".`,
    )
  }
}
