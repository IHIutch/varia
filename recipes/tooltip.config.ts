import { defineComponent } from '../packages/varia/src/index.js'

// Add group to the root and data-reveal="hover" or data-reveal="always" to the bubble.
export default defineComponent('tooltip', {
  slots: {
    root: 'relative inline-flex items-center',
    trigger: 'cursor-help underline decoration-dotted underline-offset-4',
    bubble: [
      'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
      'px-2 py-1 text-xs whitespace-nowrap',
      'bg-gray-900 text-white rounded shadow-md',
      'transition-opacity pointer-events-none',
      'data-[reveal=hover]:opacity-0 data-[reveal=hover]:group-hover:opacity-100',
      'data-[reveal=always]:opacity-100',
    ],
  },
})
