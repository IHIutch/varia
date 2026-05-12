import { defineComponent } from '../src/index.js'

// Bootstrap-equivalent Navbar, as a single varia component. Composes with
// existing recipes (form-input, dropdown, btn) without varia needing to know
// about them — slot styling just targets descendants by tag.
//
// State for the active link uses the data-state pattern; no slot-keyed
// variants for state.

export default defineComponent('navbar', {
  slots: {
    'root': [
      'flex items-center gap-6 px-6 py-3',
      'bg-white border-b border-gray-200',
    ],
    'brand': 'inline-flex items-center text-lg font-semibold text-gray-900 no-underline',
    'nav': 'flex items-center gap-1 list-none p-0 m-0',
    'nav-link': [
      'inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium',
      'text-gray-600 hover:text-gray-900 hover:bg-gray-100 no-underline',
      'transition-colors',
      'data-[state=active]:text-blue-700 data-[state=active]:bg-blue-50',
      'data-[state=active]:hover:text-blue-800',
    ],
    'spacer': 'flex-1',
    'actions': 'flex items-center gap-3',
  },
})
