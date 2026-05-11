import { defineSlotComponent } from '../src/index.js'

// First production user of defineSlotComponent. Modal is a multi-element
// component with a natural root (the backdrop) and tightly coupled children.
// The size variant uses the slot-keyed shape to target the container only —
// background, header padding, etc. don't change with size.

export default defineSlotComponent('modal', {
  slots: {
    // Full-viewport overlay; centers the container.
    root: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4',
    // The dialog box. No max-width by default — consumer always picks a size
    // variant (modal-size-sm / -md / -lg / -xl) per ADR-0003's reject-defaults
    // stance.
    container:
      'relative w-full rounded-lg bg-white shadow-xl ring-1 ring-gray-200 max-h-[90vh] overflow-hidden flex flex-col',
    // Header bar (title + optional inline close)
    header: 'flex items-start justify-between gap-4 p-4 border-b border-gray-200',
    title: 'text-lg font-semibold text-gray-900',
    description: 'mt-1 text-sm text-gray-600',
    // Scrollable middle section
    body: 'p-4 overflow-y-auto flex-1',
    // Right-aligned action row
    footer: 'flex items-center justify-end gap-2 p-4 border-t border-gray-200',
    // Floating close button at the corner of the container
    close:
      'absolute top-3 right-3 inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  },
  variants: {
    // Size is a slot-keyed multi-value variant. Each size targets the
    // container only — the backdrop, header, etc. don't change.
    size: {
      sm: { container: 'max-w-sm' },
      md: { container: 'max-w-md' },
      lg: { container: 'max-w-lg' },
      xl: { container: 'max-w-2xl' },
    },
  },
})
