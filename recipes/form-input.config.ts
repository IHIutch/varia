import { defineComponent } from '../src/index.js'

export default defineComponent('form-input', {
  base: 'block w-full rounded-md border bg-white px-3 py-2 text-base shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
  variants: {
    state: {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error:
        'border-red-500 text-red-700 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500 invalid:border-red-500',
      success:
        'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500',
    },
    s: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    },
    readonly: 'read-only:bg-gray-50 read-only:cursor-default',
  },
})
