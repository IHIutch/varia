import { defineComponent } from '../packages/varia/src/index.js'

// Bootstrap's gutter pattern, expressed with Tailwind arbitrary values:
//
//   .row { margin: 0 calc(var(--row-gx,0) / -2) }
//   .col { padding: 0 calc(var(--row-gx,0) / 2) }
//
// The row sets the `--row-gx` custom property via a variant; cols inherit it
// through the cascade and apply matching internal padding. With Tailwind's
// default `box-sizing: border-box`, an explicit `w-6/12` includes that
// padding, so two `col-span-6` siblings still fit in one row.
//
// This avoids the `gap` approach: `gap` sits *between* siblings, so the
// combined width of N siblings is `N × width + (N-1) × gap`, which overflows
// the row when widths sum to 100%.
//
// `gy` is safe with `gap-y-*` because vertical gap only adds space between
// wrapped rows; it doesn't affect horizontal sibling widths.
//
// Gutter scale maps Bootstrap g-{0..5} → 0, 0.25rem, 0.5rem, 1rem, 1.5rem, 3rem.
export default defineComponent('row', {
  base: 'flex flex-wrap mx-[calc(var(--row-gx,0)/-2)]',
  variants: {
    gx: {
      0: '[--row-gx:0]',
      1: '[--row-gx:0.25rem]',
      2: '[--row-gx:0.5rem]',
      3: '[--row-gx:1rem]',
      4: '[--row-gx:1.5rem]',
      5: '[--row-gx:3rem]',
    },
    gy: {
      0: 'gap-y-0',
      1: 'gap-y-1',
      2: 'gap-y-2',
      3: 'gap-y-4',
      4: 'gap-y-6',
      5: 'gap-y-12',
    },
    // Both-axis shorthand: equivalent to setting gx + gy together.
    g: {
      0: '[--row-gx:0] gap-y-0',
      1: '[--row-gx:0.25rem] gap-y-1',
      2: '[--row-gx:0.5rem] gap-y-2',
      3: '[--row-gx:1rem] gap-y-4',
      4: '[--row-gx:1.5rem] gap-y-6',
      5: '[--row-gx:3rem] gap-y-12',
    },
  },
})
