export function multiValueClassName(
  componentName: string,
  variantKey: string,
  variantValue: string,
): string {
  return `${componentName}-${variantKey}-${variantValue}`
}

export function booleanTrueClassName(componentName: string, variantKey: string): string {
  return `${componentName}-${variantKey}`
}

/**
 * BEM-style slot class name. The `root` slot uses the bare component name;
 * every other slot uses `componentName__slotName`.
 */
export function slotClassName(componentName: string, slotName: string): string {
  return slotName === 'root' ? componentName : `${componentName}__${slotName}`
}
