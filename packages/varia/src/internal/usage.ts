import type { Preflight } from '@unocss/core'

/** Class whose shortcut activates a component's selector-based styles. */
// Components may be bundled separately from the preset that consumes them.
export const usageTrigger = Symbol.for('varia.usageTrigger')

export type ComponentPreflight = Preflight<object> & { [usageTrigger]: string }
