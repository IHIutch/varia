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
