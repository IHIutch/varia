import { defineComponent } from '../packages/varia/src/index.js'

export default defineComponent('alert', {
  slots: {
    root: 'relative flex items-start gap-3 p-4 rounded-md border',
    icon: 'shrink-0 mt-0.5 text-xl leading-none',
    title: 'font-semibold leading-tight',
    body: 'mt-1 text-sm',
    close: [
      'absolute top-2.5 right-2.5 inline-flex items-center justify-center',
      'w-6 h-6 rounded-md text-gray-500',
      'hover:bg-black/5 hover:text-gray-700',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500',
    ],
  },
  variants: {
    c: {
      primary: {
        root: 'bg-blue-50 border-blue-200 text-blue-900',
        icon: 'text-blue-600',
      },
      success: {
        root: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        icon: 'text-emerald-600',
      },
      danger: {
        root: 'bg-red-50 border-red-200 text-red-900',
        icon: 'text-red-600',
      },
      warning: {
        root: 'bg-amber-50 border-amber-200 text-amber-900',
        icon: 'text-amber-600',
      },
    },
    // Reserve space so the absolute close button does not overlap the body.
    dismissible: { root: 'pr-12' },
  },
})
