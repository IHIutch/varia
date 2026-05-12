import { defineComponent } from '../packages/varia/src/index.js'

// Table styling via HTML tag-based descendant arbitrary variants. No declared
// slots for thead/tbody/tr/td/th — consumer writes standard table markup and
// the styling targets the elements directly. Keeps recipe and call site
// terse.
//
// Both variants (striped, hover) are flat strings — emitted as JIT shortcuts
// (.table-striped, .table-hover), so unused combinations are tree-shaken.

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
