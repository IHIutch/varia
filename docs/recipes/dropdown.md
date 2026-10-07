# Dropdown

Use slots to style the dropdown trigger, menu, items, and divider.

## Recipe

Put `dropdown-align-start` or `dropdown-align-end` on the root to position its menu through a slot variant. The menu's `data-state` attribute controls its visibility:

<<< ../../recipes/dropdown.config.ts

Items use `data-[variant=danger]:` utilities for destructive actions.

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50">
  <p class="mb-3 text-sm text-gray-700">This static preview uses <code>data-state="open"</code> to show the menu:</p>
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

## Usage

```html
<div class="dropdown dropdown-align-end">
  <button class="dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false">
    Options
  </button>
  <div class="dropdown__menu" data-state="closed" role="menu">
    <button class="dropdown__item" role="menuitem" type="button">Edit</button>
    <hr class="dropdown__divider" />
    <button class="dropdown__item" data-variant="danger" role="menuitem" type="button">Delete</button>
  </div>
</div>
```

Your menu controller must update `data-state` and `aria-expanded`, manage focus, and implement keyboard navigation and dismissal. This recipe supplies the styles.
