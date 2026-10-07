import { defineComponent } from '../packages/varia/src/index.js'

export default defineComponent('input-group', {
  slots: {
    root: [
      'inline-flex items-stretch w-full',
      // These selectors outrank child .form-input and .btn radius styles.
      '[&>*:not(:first-child)]:rounded-l-none',
      '[&>*:not(:last-child)]:rounded-r-none',
      // Overlap adjacent borders to avoid a double-width seam.
      '[&>*:not(:first-child)]:-ml-px',
    ],
    addon: [
      'inline-flex items-center px-3 py-2 text-sm rounded-md',
      'bg-gray-100 text-gray-700 border border-gray-300',
      'whitespace-nowrap',
    ],
  },
})
