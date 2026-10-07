import { defineComponent } from '../packages/varia/src/index.js'

export default defineComponent('icon-btn', {
  base: [
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium border',
    'bg-white border-gray-300 text-gray-700',
    'hover:bg-gray-50',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  variants: {
    s: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3.5 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    },
    square: 'aspect-square',
  },
  // Square buttons need equal padding, with a different value for each size.
  compoundVariants: [
    { when: { s: 'xs', square: true }, class: 'p-1' },
    { when: { s: 'sm', square: true }, class: 'p-1.5' },
    { when: { s: 'md', square: true }, class: 'p-2' },
    { when: { s: 'lg', square: true }, class: 'p-2.5' },
  ],
})
