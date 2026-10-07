import type { DefinedComponent } from './types.js'

/** Check component and class collisions before Tailwind registers rules. */
export function validateComponents(components: DefinedComponent[], integration: string): void {
  const names = new Set<string>()
  const classes = new Map<string, string>()
  for (const component of components) {
    if (names.has(component.name)) {
      throw new Error(`Duplicate component name "${component.name}" in ${integration}. Component names must be unique within an integration.`)
    }
    names.add(component.name)
    for (const className of component.classNames) {
      const owner = classes.get(className)
      if (owner !== undefined)
        throw new Error(`Duplicate class "${className}" emitted by both component "${owner}" and component "${component.name}". Each class name must be unique within an integration.`)
      classes.set(className, component.name)
    }
  }
}
