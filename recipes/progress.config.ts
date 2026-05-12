import { defineComponent } from '../packages/varia/src/index.js'

// Bootstrap-equivalent Progress. The value is a percentage that can't be
// enumerated as a variant — consumer drives it with a CSS custom property:
//   <div class="progress" style="--progress: 65%">
//     <div class="progress__bar"></div>
//   </div>
// The bar's width reads from the custom property via UnoCSS arbitrary-value
// syntax (`w-[var(--progress)]`). Colour can still be a variant axis.

export default defineComponent('progress', {
  slots: {
    root: 'block w-full h-2 overflow-hidden rounded-full bg-gray-200',
    bar: [
      'block h-full transition-[width]',
      'w-[var(--progress,0%)]',
    ],
  },
  variants: {
    c: {
      primary: { bar: 'bg-blue-600' },
      success: { bar: 'bg-emerald-600' },
      danger: { bar: 'bg-red-600' },
      warning: { bar: 'bg-amber-500' },
    },
    striped: {
      bar: [
        'bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]',
        'bg-[length:1rem_1rem]',
      ],
    },
  },
})
