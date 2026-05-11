import { defineComponent } from '../src/index.js'

const COLORS = ['primary', 'success', 'danger', 'warning', 'info', 'neutral'] as const
type Color = (typeof COLORS)[number]

const TONES: Record<Color, string> = {
  primary: 'blue',
  success: 'emerald',
  danger: 'red',
  warning: 'amber',
  info: 'sky',
  neutral: 'gray',
}

// Each color sets per-component CSS vars from the project's UnoCSS palette.
// theme() resolves at build time; if a consumer swaps their palette, these
// expansions follow automatically.
function colorVars(tone: string): string {
  return [
    `[--btn-bg:theme(colors.${tone}.600)]`,
    `[--btn-bg-hover:theme(colors.${tone}.700)]`,
    `[--btn-text:theme(colors.${tone}.700)]`,
    `[--btn-border:theme(colors.${tone}.300)]`,
    `[--btn-bg-subtle:theme(colors.${tone}.50)]`,
    `[--btn-bg-muted:theme(colors.${tone}.100)]`,
    `[--btn-focus-ring:theme(colors.${tone}.500)]`,
  ].join(' ')
}

export default defineComponent('btn', {
  base: [
    'inline-flex items-center justify-center rounded-md font-medium border',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--btn-focus-ring,theme(colors.gray.500))]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  variants: {
    c: Object.fromEntries(COLORS.map(c => [c, colorVars(TONES[c])])) as Record<Color, string>,
    style: {
      solid: [
        'bg-[var(--btn-bg)] text-white border-[var(--btn-bg)]',
        'hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-bg-hover)]',
      ].join(' '),
      outline: [
        'bg-transparent text-[var(--btn-text)] border-[var(--btn-border)]',
        'hover:bg-[var(--btn-bg-subtle)]',
      ].join(' '),
      subtle: [
        'bg-[var(--btn-bg-subtle)] text-[var(--btn-text)] border-transparent',
        'hover:bg-[var(--btn-bg-muted)]',
      ].join(' '),
      ghost: [
        'bg-transparent text-[var(--btn-text)] border-transparent',
        'hover:bg-[var(--btn-bg-subtle)]',
      ].join(' '),
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
})
