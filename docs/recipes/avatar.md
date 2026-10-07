# Avatar

## Recipe

<<< ../../recipes/avatar.config.ts

## Usage

<RecipeTabs>

<template #preview>

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 flex flex-wrap items-end gap-4">
  <span class="avatar avatar-s-sm">JB</span>
  <span class="avatar avatar-s-md">VA</span>
  <span class="avatar avatar-s-lg avatar-ring">RP</span>
  <span class="avatar avatar-s-xl">AC</span>
</div>

<div class="my-6 p-6 border border-gray-200 rounded-md" style="--avatar-bg: oklch(0.7 0.15 60); --avatar-fg: oklch(0.2 0.05 60); --avatar-ring: oklch(0.95 0.02 60); background: oklch(0.97 0.01 60);">
  <div class="flex flex-wrap items-end gap-4">
    <span class="avatar avatar-s-md">JB</span>
    <span class="avatar avatar-s-lg avatar-ring">VA</span>
    <span class="avatar avatar-s-xl">RP</span>
  </div>
</div>
:::

</template>

<template #usage>

```html
<span class="avatar avatar-s-md">JB</span>
<span class="avatar avatar-s-lg avatar-ring"
      style="--avatar-bg: rebeccapurple; --avatar-fg: white">VA</span>
```

</template>

</RecipeTabs>
