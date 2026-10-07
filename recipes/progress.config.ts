import { defineComponent } from '../packages/varia/src/index.js'

// Set --progress on the root to a percentage, such as style="--progress: 65%".
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
