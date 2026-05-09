import { defineComponent } from '../src/index.js'

export const dropdownTrigger = defineComponent('dropdown-trigger', {
  base: 'inline-flex items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
})

export const dropdownMenu = defineComponent('dropdown-menu', {
  base: 'absolute z-10 mt-2 min-w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5',
  variants: {
    align: {
      start: 'left-0',
      end: 'right-0',
    },
  },
})

export const dropdownItem = defineComponent('dropdown-item', {
  base: 'block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed',
  variants: {
    danger: 'text-red-700 hover:bg-red-50 focus:bg-red-50',
  },
})

export const dropdownDivider = defineComponent('dropdown-divider', {
  base: 'my-1 border-t-px border-gray-200',
})

export default [dropdownTrigger, dropdownMenu, dropdownItem, dropdownDivider]
