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
  context: { component: string; variantKey?: string; variantValue?: string },
): void {
  if (CLASS_NAME_RE.test(className)) return

  const where = context.variantKey
    ? ` (component "${context.component}", variant "${context.variantKey}"${
        context.variantValue !== undefined ? `, value "${context.variantValue}"` : ''
      })`
    : ` (component "${context.component}")`

  throw new Error(
    `Invalid class identifier "${className}"${where} — class names must match /^[a-z][a-z0-9-]*$/.`,
  )
}

export function validateExpansion(
  expansion: string,
  context: { className: string; component: string },
): void {
  if (expansion.trim().length === 0) {
    throw new Error(
      `Empty expansion for "${context.className}" (component "${context.component}") — variant expansions must contain at least one utility class.`,
    )
  }
}
