import { defineComponent } from '../packages/varia/src/index.js'

// `col` pairs with `row`: the row sets `--row-gx` via its variant, the col
// inherits that custom property through the cascade and uses it as symmetric
// horizontal padding. The matching negative margin on the row (see row.config)
// pulls the outer paddings outside the row's content box, so columns visually
// align flush with the container while still having internal space between
// siblings.
//
// With Tailwind's default `box-sizing: border-box`, the explicit widths below
// include this padding, so two `col-span-6` siblings sum to exactly 100% of
// the row and don't wrap.
//
// Bare `col` (no span) gets `flex-1` — Bootstrap's equal-width flex sibling
// behavior. Setting `col-span-N` carries `flex-none` to cancel the base's
// flex-grow and `w-N/12` for the explicit width.
//
// Responsive: write `md:col-span-6` on the consumer side. UnoCSS resolves the
// `md:` variant prefix against the shortcut's underlying utilities.
export default defineComponent('col', {
  base: 'flex-1 px-[calc(var(--row-gx,0)/2)]',
  variants: {
    span: {
      auto: 'flex-none w-auto',
      1: 'flex-none w-1/12',
      2: 'flex-none w-2/12',
      3: 'flex-none w-3/12',
      4: 'flex-none w-4/12',
      5: 'flex-none w-5/12',
      6: 'flex-none w-6/12',
      7: 'flex-none w-7/12',
      8: 'flex-none w-8/12',
      9: 'flex-none w-9/12',
      10: 'flex-none w-10/12',
      11: 'flex-none w-11/12',
      12: 'flex-none w-full',
    },
    offset: {
      0: 'ml-0',
      1: 'ml-1/12',
      2: 'ml-2/12',
      3: 'ml-3/12',
      4: 'ml-4/12',
      5: 'ml-5/12',
      6: 'ml-6/12',
      7: 'ml-7/12',
      8: 'ml-8/12',
      9: 'ml-9/12',
      10: 'ml-10/12',
      11: 'ml-11/12',
    },
    order: {
      first: 'order-first',
      last: 'order-last',
      0: 'order-0',
      1: 'order-1',
      2: 'order-2',
      3: 'order-3',
      4: 'order-4',
      5: 'order-5',
    },
  },
})
