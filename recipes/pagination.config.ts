import { defineComponent } from '../src/index.js'

// Bootstrap-equivalent Pagination. State (active, disabled) lives as
// data-attrs on the link element (per the tooltip pattern), not as slot
// classes (per the nav pattern). This is the cleaner approach now that we
// know slot-keyed variant values can't reliably target data-attr selectors.

export default defineComponent('pagination', {
  slots: {
    root: 'inline-flex items-center list-none p-0 m-0 -space-x-px',
    item: 'inline-flex',
    link: [
      // Base appearance: white box with blue link text, gray border.
      'inline-flex items-center justify-center min-w-10 px-3 py-2 text-sm',
      'bg-white text-blue-600 border border-gray-300',
      'hover:bg-gray-50 hover:text-blue-700 hover:z-10',
      'transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:z-10',
      // State (data-attr driven, no varia variant axis):
      'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:hover:bg-blue-600 data-[state=active]:z-10',
      'data-[state=disabled]:text-gray-400 data-[state=disabled]:pointer-events-none data-[state=disabled]:hover:bg-white',
    ],
  },
})
