import { defineComponent } from '../packages/varia/src/index.js'

// Use <details> for item and <summary> for trigger; the caret follows the open attribute.
export default defineComponent('accordion', {
  slots: {
    root: 'block border border-gray-200 rounded-md divide-y divide-gray-200 overflow-hidden bg-white',
    item: 'block',
    trigger: [
      'cursor-pointer select-none w-full text-left px-4 py-3',
      'flex items-center justify-between gap-3',
      'text-sm font-medium text-gray-900',
      'hover:bg-gray-50 transition-colors',
      'list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden',
    ],
    caret: 'transition-transform text-gray-400 [details[open]_&]:rotate-180',
    panel: 'px-4 pb-3 text-sm text-gray-700',
  },
})
