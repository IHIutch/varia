import { defineComponent } from '../packages/varia/src/index.js'

// Bootstrap-equivalent Input Group. Wraps a `.form-input` with optional
// addon segments (text labels or buttons) that share a border with the input.
//
// The interesting design problem: when the input group contains a form-input,
// the form-input's own border-radius should collapse with its neighbors. Bootstrap
// expresses this via descendant selectors (`.input-group > .form-control { border-radius: 0 }`).
// Here we do the same via Tailwind arbitrary variants in the root slot expansion,
// which lets the wrapper coordinate with foreign-component children without
// either component knowing about the other.

export default defineComponent('input-group', {
  slots: {
    root: [
      'inline-flex items-stretch w-full',
      // Strip every child's border-radius first, then re-round the ends.
      // Uses descendant arbitrary variants (Tailwind handles natively).
      '[&>*]:rounded-none',
      '[&>*:first-child]:rounded-l-md',
      '[&>*:last-child]:rounded-r-md',
      // Collapse neighboring borders: every non-first child shifts left by 1px.
      '[&>*:not(:first-child)]:-ml-px',
    ],
    addon: [
      'inline-flex items-center px-3 py-2 text-sm',
      'bg-gray-100 text-gray-700 border border-gray-300',
      'whitespace-nowrap',
    ],
  },
})
