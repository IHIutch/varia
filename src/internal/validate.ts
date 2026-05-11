const CLASS_NAME_RE = /^[a-z][a-z0-9-]*$/
// Slot class names follow BEM: optional double-underscore segment for the slot
// suffix (e.g., `card__title`). The component name and the slot name each
// individually match CLASS_NAME_RE; the `__` separator joins them.
const SLOT_CLASS_NAME_RE = /^[a-z][a-z0-9-]*(?:__[a-z][a-z0-9-]*)?$/

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
    /** Slot classes follow BEM (`name__slot`) and use a looser regex. */
    allowBem?: boolean
  },
): void {
  const re = context.allowBem ? SLOT_CLASS_NAME_RE : CLASS_NAME_RE
  if (re.test(className)) return

  const where = context.variantKey
    ? ` (component "${context.component}", variant "${context.variantKey}"${
        context.variantValue !== undefined ? `, value "${context.variantValue}"` : ''
      })`
    : ` (component "${context.component}")`

  const expected = context.allowBem
    ? `/^[a-z][a-z0-9-]*(?:__[a-z][a-z0-9-]*)?$/`
    : `/^[a-z][a-z0-9-]*$/`

  throw new Error(
    `Invalid class identifier "${className}"${where} — class names must match ${expected}.`,
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
