import { defineComponent } from '../src/index.js'

// Separator between items via pseudo-element on every non-first item.
// Active item is the last one (current page) — set via data-state="active".

export default defineComponent('breadcrumb', {
  slots: {
    root: 'flex flex-wrap items-center list-none p-0 m-0 gap-2 text-sm',
    item: [
      'inline-flex items-center text-blue-600 hover:text-blue-800',
      // Separator before every non-first item, via ::before pseudo-element
      '[&:not(:first-child)]:before:content-["/"]',
      '[&:not(:first-child)]:before:text-gray-400',
      '[&:not(:first-child)]:before:mr-2',
      // Active state (current page): gray, no hover, not a link
      'data-[state=active]:text-gray-500 data-[state=active]:hover:text-gray-500 data-[state=active]:pointer-events-none',
    ],
  },
})
