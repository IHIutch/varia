import { defineComponent } from '../packages/varia/src/index.js'

// Set data-state="active" on the current page item.
export default defineComponent('breadcrumb', {
  slots: {
    root: 'flex flex-wrap items-center list-none p-0 m-0 gap-2 text-sm',
    item: [
      'inline-flex items-center text-blue-600 hover:text-blue-800',
      '[&:not(:first-child)]:before:content-["/"]',
      '[&:not(:first-child)]:before:text-gray-400',
      '[&:not(:first-child)]:before:mr-2',
      'data-[state=active]:text-gray-500 data-[state=active]:hover:text-gray-500 data-[state=active]:pointer-events-none',
    ],
  },
})
