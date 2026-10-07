import { defineComponent } from '../packages/varia/src/index.js'

// Set data-state="active" or data-state="disabled" on the link.
export default defineComponent('pagination', {
  slots: {
    root: 'inline-flex items-center list-none p-0 m-0 -space-x-px',
    item: 'inline-flex',
    link: [
      'inline-flex items-center justify-center min-w-10 px-3 py-2 text-sm',
      'bg-white text-blue-600 border border-gray-300',
      'hover:bg-gray-50 hover:text-blue-700 hover:z-10',
      'transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:z-10',
      'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:hover:bg-blue-600 data-[state=active]:z-10',
      'data-[state=disabled]:text-gray-400 data-[state=disabled]:pointer-events-none data-[state=disabled]:hover:bg-white',
    ],
  },
})
