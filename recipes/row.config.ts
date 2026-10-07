import { defineComponent } from '../packages/varia/src/index.js'

// Horizontal gutters use column padding so widths totaling 100% still fit.
// The row's negative margin cancels the outer column padding.
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
