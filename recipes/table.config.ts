import { defineComponent } from '../packages/varia/src/index.js'

// Apply table to a <table> with standard thead, tbody, th, and td markup.
export default defineComponent('table', {
  base: [
    'w-full text-sm text-left border-collapse',
    '[&_thead]:bg-gray-50 [&_thead_th]:font-medium [&_thead_th]:text-gray-700',
    '[&_th]:px-4 [&_th]:py-2 [&_th]:border-b [&_th]:border-gray-200',
    '[&_td]:px-4 [&_td]:py-2 [&_td]:border-b [&_td]:border-gray-200',
  ],
  variants: {
    striped: '[&_tbody_tr:nth-child(even)]:bg-gray-50',
    hover: '[&_tbody_tr:hover]:bg-gray-50',
  },
})
