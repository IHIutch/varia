import { defineComponent } from '../src/index.js'

// Bootstrap-equivalent Nav, expressed as a single varia component.
//
// State (active, disabled) lives as SLOTS rather than as a separate
// `nav-link` component with its own variants. This lets the `style` variant
// carry slot-keyed values that target the state slots directly — which is
// how the per-style active appearance ends up as a descendant rule like
// `.nav-style-pills .nav__link-active { ... }`, matching Bootstrap's
// `.nav-pills .nav-link.active { ... }`.

export default defineComponent('nav', {
  slots: {
    'root': 'flex flex-wrap items-center list-none p-0 m-0',
    'item': 'inline-flex',
    'link': [
      'block px-4 py-2 text-base no-underline',
      'text-blue-600 hover:text-blue-800',
      'border border-transparent',
      'transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
    ],
    // States expressed as slots. Consumer toggles `nav__link-active` /
    // `nav__link-disabled` on the same element that carries `nav__link`.
    'link-active': 'text-gray-900 hover:text-gray-900',
    'link-disabled': 'text-gray-500 pointer-events-none cursor-default',
  },
  variants: {
    style: {
      tabs: {
        'root': 'border-b border-gray-300',
        'link': 'rounded-t-md -mb-px',
        'link-active': 'bg-white border-gray-300 border-b-white -mb-px',
      },
      pills: {
        'link': 'rounded-md',
        'link-active':
          'text-white bg-blue-600 border-blue-600 hover:bg-blue-700 hover:text-white',
      },
    },
  },
})
