import { defineComponent } from '../src/index.js'

export default defineComponent('spinner', {
  base: 'inline-block rounded-full border-current border-solid animate-spin',
  variants: {
    s: {
      sm: 'w-4 h-4 border-2 border-r-transparent',
      md: 'w-6 h-6 border-2 border-r-transparent',
      lg: 'w-10 h-10 border-4 border-r-transparent',
    },
    c: {
      primary: 'text-blue-600',
      muted: 'text-gray-400',
      danger: 'text-red-600',
    },
  },
})
