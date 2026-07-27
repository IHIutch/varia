import { defineComponent } from '../packages/varia/src/index.js'

// `compoundVariants` lists one entry per (color, style) cell with the class
// names spelled out in full. Tailwind and UnoCSS both recommend against
// constructing class names with template literals — the JIT extractor only
// finds string literals it can read directly from source, so `bg-${t}-600`
// silently disappears from the scan and any theme variables those classes
// would have registered (e.g. `--colors-emerald-600`) never get emitted.
//
// Spelling each cell out is more verbose, but it's the pattern the underlying
// tools expect.
export default defineComponent('btn', {
  base: [
    'inline-flex items-center justify-center rounded-md font-medium border',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  variants: {
    c: {
      primary: 'focus-visible:ring-blue-500',
      success: 'focus-visible:ring-emerald-500',
      danger: 'focus-visible:ring-red-500',
      warning: 'focus-visible:ring-amber-500',
      neutral: 'focus-visible:ring-gray-500',
    },
    style: {
      solid: 'text-white',
      outline: 'bg-transparent',
      subtle: 'border-transparent',
      ghost: 'bg-transparent border-transparent',
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
  compoundVariants: [
    // primary (blue)
    { when: { c: 'primary', style: 'solid' }, class: 'bg-blue-600 border-blue-600 hover:bg-blue-700' },
    { when: { c: 'primary', style: 'outline' }, class: 'text-blue-700 border-blue-300 hover:bg-blue-50' },
    { when: { c: 'primary', style: 'subtle' }, class: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { when: { c: 'primary', style: 'ghost' }, class: 'text-blue-700 hover:bg-blue-50' },

    // success (emerald)
    { when: { c: 'success', style: 'solid' }, class: 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' },
    { when: { c: 'success', style: 'outline' }, class: 'text-emerald-700 border-emerald-300 hover:bg-emerald-50' },
    { when: { c: 'success', style: 'subtle' }, class: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { when: { c: 'success', style: 'ghost' }, class: 'text-emerald-700 hover:bg-emerald-50' },

    // danger (red)
    { when: { c: 'danger', style: 'solid' }, class: 'bg-red-600 border-red-600 hover:bg-red-700' },
    { when: { c: 'danger', style: 'outline' }, class: 'text-red-700 border-red-300 hover:bg-red-50' },
    { when: { c: 'danger', style: 'subtle' }, class: 'bg-red-50 text-red-700 hover:bg-red-100' },
    { when: { c: 'danger', style: 'ghost' }, class: 'text-red-700 hover:bg-red-50' },

    // warning (amber)
    { when: { c: 'warning', style: 'solid' }, class: 'bg-amber-600 border-amber-600 hover:bg-amber-700' },
    { when: { c: 'warning', style: 'outline' }, class: 'text-amber-700 border-amber-300 hover:bg-amber-50' },
    { when: { c: 'warning', style: 'subtle' }, class: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { when: { c: 'warning', style: 'ghost' }, class: 'text-amber-700 hover:bg-amber-50' },

    // neutral (gray)
    { when: { c: 'neutral', style: 'solid' }, class: 'bg-gray-600 border-gray-600 hover:bg-gray-700' },
    { when: { c: 'neutral', style: 'outline' }, class: 'text-gray-700 border-gray-300 hover:bg-gray-50' },
    { when: { c: 'neutral', style: 'subtle' }, class: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
    { when: { c: 'neutral', style: 'ghost' }, class: 'text-gray-700 hover:bg-gray-50' },
  ],
})
