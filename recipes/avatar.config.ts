import { defineComponent } from '../src/index.js'

export default defineComponent('avatar', {
  base: 'inline-flex items-center justify-center rounded-full overflow-hidden bg-[var(--avatar-bg,theme(colors.gray.200))] text-[var(--avatar-fg,theme(colors.gray.700))] font-medium select-none',
  variants: {
    s: {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-14 h-14 text-base',
      xl: 'w-20 h-20 text-lg',
    },
    ring: 'ring-2 ring-[var(--avatar-ring,theme(colors.white))] ring-offset-2 ring-offset-[var(--avatar-ring-offset,theme(colors.gray.100))]',
  },
})
