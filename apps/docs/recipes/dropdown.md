# Dropdown

A dropdown with root, trigger, menu, item, and divider slots. The menu uses `data-state` for open and closed states. Items use `data-variant` for styles such as destructive actions. JavaScript changes those attributes.

## Authoring

```ts
// recipes/dropdown.config.ts
import { defineComponent } from 'varia'

export default defineComponent('dropdown', {
  slots: {
    root: 'relative inline-block',
    trigger: [
      'inline-flex items-center justify-between gap-2 px-3 py-2',
      'rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700',
      'shadow-sm hover:bg-gray-50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
    ],
    menu: [
      'absolute z-10 mt-2 min-w-40 origin-top-right',
      'rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5',
      // Hidden by default; data-state=open reveals it (higher specificity wins).
      'hidden data-[state=open]:block',
    ],
    item: [
      'block w-full px-4 py-2 text-left text-sm text-gray-700',
      'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
      'disabled:text-gray-400 disabled:cursor-not-allowed',
      // Per-item destructive variant via data-variant.
      'data-[variant=danger]:text-red-700 data-[variant=danger]:hover:bg-red-50',
      'data-[variant=danger]:focus:bg-red-50',
    ],
    divider: 'my-1 border-t border-gray-200',
  },
  variants: {
    align: {
      start: { menu: 'left-0' },
      end: { menu: 'right-0' },
    },
  },
})
```

Alignment and state target different elements:

1. Put the `align` variant on the root, such as `<div class="dropdown dropdown-align-end">`. Its slot-keyed rule emits `.dropdown-align-end .dropdown__menu { right: 0 }` to position the menu relative to the root.

2. The menu uses `hidden data-[state=open]:block`. It stays hidden until JavaScript sets `data-state="open"` on the menu element.

3. Destructive item styles use `data-variant`. Add other item styles with `data-[variant=...]:` utilities in the `item` slot.

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50">
  <p class="mb-3 text-sm text-gray-700">A dropdown rendered statically with <code>data-state="open"</code> so you can see all the slots at once:</p>
  <div class="dropdown dropdown-align-start" style="position: static;">
    <button class="dropdown__trigger" type="button">
      Options
      <span aria-hidden="true">▾</span>
    </button>
    <div class="dropdown__menu" data-state="open" style="position: static; margin-top: 0.5rem;" role="menu">
      <button class="dropdown__item" role="menuitem" type="button">Edit</button>
      <button class="dropdown__item" role="menuitem" type="button">Duplicate</button>
      <hr class="dropdown__divider" />
      <button class="dropdown__item" data-variant="danger" role="menuitem" type="button">Delete</button>
    </div>
  </div>
</div>
:::

## Consumption

```html
<div class="dropdown dropdown-align-end">
  <button class="dropdown__trigger" aria-haspopup="menu" aria-expanded="false">
    Options
    <svg>...chevron...</svg>
  </button>

  <div class="dropdown__menu" data-state="closed" role="menu">
    <button class="dropdown__item" role="menuitem">Edit</button>
    <button class="dropdown__item" role="menuitem">Duplicate</button>
    <hr class="dropdown__divider" />
    <button class="dropdown__item" data-variant="danger" role="menuitem">Delete</button>
  </div>
</div>
```

Toggle the menu state with JavaScript:

```ts
const trigger = document.querySelector('.dropdown__trigger')
const menu = document.querySelector('.dropdown__menu')

function setOpen(open: boolean) {
  menu.setAttribute('data-state', open ? 'open' : 'closed')
  trigger.setAttribute('aria-expanded', String(open))
}

trigger.addEventListener('click', () => {
  setOpen(menu.getAttribute('data-state') !== 'open')
})
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !trigger.contains(e.target))
    setOpen(false)
})
```

## Generated class names

| Class | Element |
|---|---|
| `dropdown` | The root wrapper (`position: relative`) |
| `dropdown__trigger` | The button that opens the menu |
| `dropdown__menu` | The popup container (hidden until `data-state="open"`) |
| `dropdown__item` | A clickable menu row |
| `dropdown__divider` | A horizontal separator |
| `dropdown-align-start` / `dropdown-align-end` | Variant on the root that anchors the menu's left or right edge |

The recipe generates seven classes and uses two data attributes for state and item styling.
