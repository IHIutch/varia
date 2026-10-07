import { defineComponent } from '../packages/varia/src/index.js'

export default defineComponent('modal', {
  slots: {
    root: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4',
    // Choose a modal-size-* class on the root to set the container's max-width.
    container:
      'relative w-full rounded-lg bg-white shadow-xl ring-1 ring-gray-200 max-h-[90vh] overflow-hidden flex flex-col',
    header: 'flex items-start justify-between gap-4 p-4 border-b border-gray-200',
    title: 'text-lg font-semibold text-gray-900',
    description: 'mt-1 text-sm text-gray-600',
    body: 'p-4 overflow-y-auto flex-1',
    footer: 'flex items-center justify-end gap-2 p-4 border-t border-gray-200',
    close:
      'absolute top-3 right-3 inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  },
  variants: {
    size: {
      sm: { container: 'max-w-sm' },
      md: { container: 'max-w-md' },
      lg: { container: 'max-w-lg' },
      xl: { container: 'max-w-2xl' },
    },
  },
})
