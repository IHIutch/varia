// Prototype validating ADR-0002 (compound variants).
//
// Builds a Button with cross-axis rules that the per-component-vars approach
// can't express: size × square (different padding per square size), and
// loading × leading (animate-spin on the leading icon when both are set).
//
// Like the slot prototype, this uses preflights to emit compound CSS rules
// directly — bypassing UnoCSS's content-scan-based tree-shaking. That's the
// design choice committed by ADR-0001's validation: emit through preflights
// for guaranteed presence.
//
// Quarantined to recipes/_proto/. Not registered in docs/unocss.config.ts.

import type { Preset } from 'unocss'

// Base shortcuts the prototype declares — equivalent to what a defineComponent
// call would produce for the variant axes referenced by the compounds below.
const baseShortcuts: [string, string][] = [
  ['cbtn',          'inline-flex items-center justify-center rounded-md font-medium border transition-colors disabled:opacity-50'],
  ['cbtn-s-xs',     'px-2 py-1 text-xs'],
  ['cbtn-s-sm',     'px-2.5 py-1.5 text-xs'],
  ['cbtn-s-md',     'px-3 py-2 text-sm'],
  ['cbtn-s-lg',     'px-4 py-2.5 text-base'],
  ['cbtn-square',   'aspect-square'],
  ['cbtn-loading',  ''],
  ['cbtn-leading',  ''],
  ['cbtn__icon',    'inline-block size-4'],
]

// Compound rules expressed as literal CSS in a preflight. Each compound has a
// selector that combines two or more variant class names; the consumer writes
// the individual variant classes and the compound's CSS applies automatically
// when both happen to be present on the same element.
//
// Production implementation would resolve utility strings to CSS properties
// via UnoCSS's resolver. The prototype writes resolved properties directly.
const compoundRulesCSS = `
/* size × square: different padding per square size */
.cbtn-s-xs.cbtn-square { padding: 0.25rem; }
.cbtn-s-sm.cbtn-square { padding: 0.375rem; }
.cbtn-s-md.cbtn-square { padding: 0.5rem; }
.cbtn-s-lg.cbtn-square { padding: 0.625rem; }

/* loading × leading: animate the leading icon when both flags are set */
.cbtn-loading.cbtn-leading .cbtn__icon {
  animation: spin 1s linear infinite;
}
`.trim()

export const buttonCompoundProto: Preset = {
  name: 'button-compound-proto',
  shortcuts: baseShortcuts,
  preflights: [
    {
      getCSS: () => compoundRulesCSS,
    },
  ],
}
