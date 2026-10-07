import type { VariaClasses } from 'varia/types'

export function cn(...classes: VariaClasses[]): string {
  return classes.join(' ')
}
