# Dropdown

## Recipe

<<< ../../recipes/dropdown.config.ts

## Usage

<RecipeTabs>

<template #preview>

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50">
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

</template>

<template #usage>

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

</template>

</RecipeTabs>
