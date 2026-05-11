import { defineComponent } from '../src/index.js'

// IconButton: a button that can render with a label, with just an icon, or
// with both. The `square` boolean signals "icon-only" — the consumer is
// rendering no text. When square, the regular size-variant's horizontal
// padding (px-3, px-4, …) is too wide; we want EQUAL padding all around so
// the icon sits centered in a square box.
//
// This is the canonical case for `compoundVariants`: the padding for the
// "small + square" cell can't be derived from "small" alone or "square"
// alone — both axes have to be set together to know the right value.

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
    // Size sets text/icon size AND padding for labeled buttons (wider
    // horizontal than vertical, which reads as a button shape).
    s: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3.5 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    },
    // Icon-only flag. By itself this only forces a square aspect ratio.
    // The actual padding that makes the square work is in compoundVariants.
    square: 'aspect-square',
  },
  // Compound rules: when `square` is set, override the asymmetric size
  // padding with equal padding on all four sides. Each size needs its own
  // matched value — that's the cross-axis dependency.
  compoundVariants: [
    { when: { s: 'xs', square: true }, class: 'p-1' },
    { when: { s: 'sm', square: true }, class: 'p-1.5' },
    { when: { s: 'md', square: true }, class: 'p-2' },
    { when: { s: 'lg', square: true }, class: 'p-2.5' },
  ],
})
