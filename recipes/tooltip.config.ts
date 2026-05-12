import { defineComponent } from '../src/index.js'

// Reveal mode driven by `data-reveal` attr on the bubble. No varia variants,
// no slot-keyed values — utilities at the base slot run through UnoCSS
// natively, so `group-hover:` works.

export default defineComponent('tooltip', {
  slots: {
    // `group` is a marker class that UnoCSS shortcuts can't include in their
    // expansion — consumer must add it manually: <span class="tooltip group">
    root: 'relative inline-flex items-center',
    trigger: 'cursor-help underline decoration-dotted underline-offset-4',
    bubble: [
      'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
      'px-2 py-1 text-xs whitespace-nowrap',
      'bg-gray-900 text-white rounded shadow-md',
      'transition-opacity pointer-events-none',
      // reveal=hover: hidden, visible on parent group hover
      'data-[reveal=hover]:opacity-0 data-[reveal=hover]:group-hover:opacity-100',
      // reveal=always: always visible
      'data-[reveal=always]:opacity-100',
    ],
  },
})
