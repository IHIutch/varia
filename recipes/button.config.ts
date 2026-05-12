import { defineComponent } from '../packages/varia/src/index.js'

// Map each semantic color name to a UnoCSS palette tone. Five colors keep the
// example tight; the same shape extends to as many as a real design system
// needs.
const COLORS = {
  primary: 'blue',
  success: 'emerald',
  danger: 'red',
  warning: 'amber',
  neutral: 'gray',
} as const

type Color = keyof typeof COLORS

// For each color, produce one compound rule per style. The compound sets the
// concrete colours (bg, border, text, hover-bg) — the `c` and `style` variant
// shortcuts just carry properties that are constant across the matrix.
function compoundsFor(c: Color) {
  const t = COLORS[c]
  return [
    { when: { c, style: 'solid' }, class: `bg-${t}-600 border-${t}-600 hover:bg-${t}-700` },
    { when: { c, style: 'outline' }, class: `text-${t}-700 border-${t}-300 hover:bg-${t}-50` },
    { when: { c, style: 'subtle' }, class: `bg-${t}-50 text-${t}-700 hover:bg-${t}-100` },
    { when: { c, style: 'ghost' }, class: `text-${t}-700 hover:bg-${t}-50` },
  ]
}

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
  compoundVariants: (Object.keys(COLORS) as Color[]).flatMap(compoundsFor),
})
