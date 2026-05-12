import { defineComponent } from '../src/index.js'

export default defineComponent('badge', {
  base: 'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md',
  variants: {
    c: {
      primary: 'bg-blue-100 text-blue-800',
      success: 'bg-emerald-100 text-emerald-800',
      danger: 'bg-red-100 text-red-800',
      warning: 'bg-amber-100 text-amber-800',
      neutral: 'bg-gray-100 text-gray-800',
    },
    // Boolean: rounded sides instead of rounded corners
    pill: 'rounded-full px-2.5',
  },
})
