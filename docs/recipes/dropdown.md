# Dropdown

The multi-element example. `varia` v1 deliberately ships without slots. A multi-element widget like a dropdown is composed of multiple sibling `defineComponent` calls. This recipe exists to test whether that constraint is acceptable in practice.

## Authoring

```ts
// recipes/dropdown.config.ts
import { defineComponent } from 'varia'

export const dropdownTrigger = defineComponent('dropdown-trigger', {
  base: 'inline-flex items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
})

export const dropdownMenu = defineComponent('dropdown-menu', {
  base: 'absolute z-10 mt-2 min-w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5',
  variants: {
    align: { start: 'left-0', end: 'right-0' },
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
```

The default export is the array. Consumers spread the whole family into `presetVaria` in one go:

```ts
// unocss.config.ts
import dropdown from './recipes/dropdown.config'

export default defineConfig({
  presets: [
    presetWind4(),
    presetVaria({ components: [...dropdown, button, alert] }),
  ],
})
```

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50">
  <p class="mb-3 text-sm text-gray-700">A dropdown rendered statically (open) so you can see all four components at once:</p>
  <div class="relative inline-block">
    <button class="dropdown-trigger" type="button">
      Options
      <span aria-hidden="true">▾</span>
    </button>
    <div class="dropdown-menu dropdown-menu-align-start" style="position: static; margin-top: 0.5rem;" role="menu">
      <button class="dropdown-item" role="menuitem" type="button">Edit</button>
      <button class="dropdown-item" role="menuitem" type="button">Duplicate</button>
      <hr class="dropdown-divider" />
      <button class="dropdown-item dropdown-item-danger" role="menuitem" type="button">Delete</button>
    </div>
  </div>
</div>
:::

## Consumption

```html
<div class="relative inline-block">
  <button class="dropdown-trigger" aria-expanded="false">
    Options
    <svg>…chevron…</svg>
  </button>

  <div class="dropdown-menu dropdown-menu-align-end" role="menu">
    <button class="dropdown-item" role="menuitem">Edit</button>
    <button class="dropdown-item" role="menuitem">Duplicate</button>
    <hr class="dropdown-divider" />
    <button class="dropdown-item dropdown-item-danger" role="menuitem">Delete</button>
  </div>
</div>
```

## What's being demonstrated

- No slots required. Each part is a standalone component with its own variants. The tree is implicit in the markup, not in the config.
- Shared namespace via the `dropdown-` prefix keeps related classes grep-able and visually grouped: `dropdown-trigger`, `dropdown-menu`, `dropdown-item`, `dropdown-divider`.
- Per-element variants compose independently. `dropdown-menu-align-end` is a property of the menu; `dropdown-item-danger` is a property of an item. No cross-element coupling.
- Behavior (open/close, keyboard navigation, focus management) is the consumer's responsibility; `varia` doesn't ship a runtime. Pair these classes with your framework's dropdown logic of choice (Radix, Headless UI, Reka UI, hand-rolled).

## Generated class names

| Class | Element |
|---|---|
| `dropdown-trigger` | The button that opens the menu |
| `dropdown-menu` | The popup container |
| `dropdown-menu-align-start` / `-align-end` | Horizontal anchor |
| `dropdown-item` | A clickable menu row |
| `dropdown-item-danger` | Destructive variant of an item |
| `dropdown-divider` | A horizontal separator |

Seven classes, four components, zero slots.

## Sibling components vs. slots

The same dropdown could also be expressed with `defineSlotComponent`:

```ts
defineSlotComponent('dropdown', {
  slots: {
    root: '...',
    trigger: '...',
    menu: '...',
    item: '...',
    divider: '...',
  },
})
```

with class names like `dropdown__trigger`, `dropdown__menu`, etc. (See the [Modal recipe](/recipes/modal) for the slot-component shape.)

Both forms are first-class. The choice between them is a judgment call:

| Sibling components (this recipe) | Slot component |
|---|---|
| Each part has its own variant axes that compose independently. | The whole component has shared variant axes that can target specific slots. |
| Parts are loosely coupled — `dropdown-trigger` and `dropdown-menu` don't need to be siblings in the DOM. | Parts are tightly coupled inside a single container, and slot-keyed variants need the descendant relationship to work. |
| You don't need a wrapping element — the trigger and menu live anywhere. | A wrapping element (or at least a shared ancestor) carries the variant class. |

The Dropdown stays as sibling components in `varia`'s recipes for the first reason: there's no single ancestor that "owns" both the trigger and the menu (an absolutely-positioned menu often portals out of the trigger's container), and per-part variants like `dropdown-menu-align-end` and `dropdown-item-danger` compose better when each part owns its own axes.
