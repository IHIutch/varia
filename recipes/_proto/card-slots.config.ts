// Prototype validating ADR-0001 (slots).
//
// varia's API today doesn't have defineSlotComponent. This file constructs
// the OUTPUT SHAPE that defineSlotComponent will produce — slot shortcuts
// for base slot classes plus literal CSS rules with descendant selectors
// for slot-keyed variants — and exposes it as a UnoCSS preset directly.
//
// The associated test (test/recipes/_proto/card-slots.test.ts) runs this
// through real UnoCSS to validate three load-bearing assumptions:
//   1. Slot shortcuts emit (card, card__header, card__title, ...).
//   2. String-returning variants emit as plain shortcuts (card-elevated).
//   3. Slot-keyed variants emit as descendant-selector CSS rules
//      (.card-accent .card__title { ... }) AND survive tree-shaking when
//      only the root variant class is referenced.
//
// Quarantined to recipes/_proto/. Not registered in docs/unocss.config.ts.
// Not added to the docs site. Sandbox only.

import type { Preset } from 'unocss'

// Slot base classes. Root is the bare component name; others use BEM.
const slotShortcuts: [string, string][] = [
  ['card',              'rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200'],
  ['card__header',      'p-4 border-b border-gray-200'],
  ['card__title',       'font-semibold text-gray-900'],
  ['card__description', 'mt-1 text-sm text-gray-600'],
  ['card__body',        'p-4'],
  ['card__footer',      'p-4 border-t border-gray-200'],
]

// String-returning variant: applies to root, emits as a shortcut.
const stringVariantShortcuts: [string, string][] = [
  ['card-elevated', 'shadow-xl ring-1 ring-gray-300'],
]

// Slot-keyed variant `accent` would be authored as:
//   accent: {
//     root:   'ring-2 ring-blue-500',
//     header: 'bg-blue-50 border-blue-200',
//     title:  'text-blue-900',
//   }
//
// Prototype's emission: a preflight with literal CSS using descendant selectors.
// The real implementation would resolve utility strings to CSS properties via
// UnoCSS's resolver; the prototype writes the resolved CSS directly so we can
// validate the descendant-selector + tree-shaking story without that machinery.
const slotKeyedVariantCSS = `
.card-accent {
  --un-ring-width: 2px;
  --un-ring-color: rgb(59 130 246);
  box-shadow: 0 0 0 var(--un-ring-width) var(--un-ring-color);
}
.card-accent .card__header {
  background-color: rgb(239 246 255);
  border-color: rgb(191 219 254);
}
.card-accent .card__title {
  color: rgb(30 58 138);
}
`.trim()

export const cardSlotsProto: Preset = {
  name: 'card-slots-proto',
  shortcuts: [...slotShortcuts, ...stringVariantShortcuts],
  preflights: [
    {
      getCSS: () => slotKeyedVariantCSS,
    },
  ],
}

// Exported for the test to introspect the expected emissions.
export const expectedSlotClasses = slotShortcuts.map(([name]) => name)
export const expectedVariantClasses = stringVariantShortcuts.map(([name]) => name)
