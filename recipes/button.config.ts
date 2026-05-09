import { defineComponent } from '../src/index.js'

export default defineComponent('btn', {
  base: 'inline-block font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    c: {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500',
      ghost:
        'bg-transparent text-gray-900 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400',
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
    outline: 'bg-transparent border-2 hover:bg-current/10',
    block: 'block w-full',
  },
})
