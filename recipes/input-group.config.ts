import { defineComponent } from '../packages/varia/src/index.js'

// Bootstrap-equivalent Input Group. Wraps a `.form-input` with optional
// addon segments (text labels or buttons) that share a border with the input.
//
// The interesting design problem: when the input group contains a form-input,
// the form-input's own border-radius should collapse with its neighbors. Bootstrap
// expresses this via descendant selectors (`.input-group > .form-control { border-radius: 0 }`).
// Here we do the same via arbitrary variants in the root slot expansion, which
// lets the wrapper coordinate with foreign-component children without either
// component knowing about the other.
//
// Engines order rules from different components in the same layer differently,
// so these overrides rely on specificity: `.input-group>:not(:first-child)`
// outranks a child's own `.form-input` or `.btn`.

export default defineComponent('input-group', {
  slots: {
    root: [
      'inline-flex items-stretch w-full',
      // Square the inner edges; each child keeps its own outer radius.
      '[&>*:not(:first-child)]:rounded-l-none',
      '[&>*:not(:last-child)]:rounded-r-none',
      // Collapse neighboring borders: every non-first child shifts left by 1px.
      '[&>*:not(:first-child)]:-ml-px',
    ],
    addon: [
      'inline-flex items-center px-3 py-2 text-sm rounded-md',
      'bg-gray-100 text-gray-700 border border-gray-300',
      'whitespace-nowrap',
    ],
  },
})
