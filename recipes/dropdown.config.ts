import { defineComponent } from '../src/index.js'

// Single-component dropdown. Open/closed state lives in `data-state` on the
// menu; consumer toggles via JS. Item variants (default vs danger) live as
// `data-variant` on each item. Aligns left or right via a multi-value
// variant on the menu slot.

export default defineComponent('dropdown', {
  slots: {
    root: 'relative inline-block',
    trigger: [
      'inline-flex items-center justify-between gap-2 px-3 py-2',
      'rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700',
      'shadow-sm hover:bg-gray-50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
    ],
    menu: [
      'absolute z-10 mt-2 min-w-40 origin-top-right',
      'rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5',
      // Default hidden; data-state=open reveals via higher-specificity rule
      'hidden data-[state=open]:block',
    ],
    item: [
      'block w-full px-4 py-2 text-left text-sm text-gray-700',
      'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
      'disabled:text-gray-400 disabled:cursor-not-allowed',
      // Per-item variant via data-variant attribute (no slot proliferation)
      'data-[variant=danger]:text-red-700 data-[variant=danger]:hover:bg-red-50',
      'data-[variant=danger]:focus:bg-red-50',
    ],
    divider: 'my-1 border-t border-gray-200',
  },
  variants: {
    align: {
      start: { menu: 'left-0' },
      end: { menu: 'right-0' },
    },
  },
})
