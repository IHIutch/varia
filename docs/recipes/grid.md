# Grid

## Recipes

::: code-group

<<< ../../recipes/row.config.ts

<<< ../../recipes/col.config.ts

:::

## Usage

<RecipeTabs>

<template #preview>

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 space-y-4 vp-raw">
  <div class="row row-g-3">
    <div class="col"><div class="bg-blue-100 p-2 rounded">A</div></div>
    <div class="col"><div class="bg-blue-100 p-2 rounded">B</div></div>
    <div class="col"><div class="bg-blue-100 p-2 rounded">C</div></div>
  </div>
  <div class="row row-g-3">
    <div class="col col-span-8"><div class="bg-emerald-100 p-2 rounded">span 8</div></div>
    <div class="col col-span-4"><div class="bg-emerald-100 p-2 rounded">span 4</div></div>
  </div>
  <div class="row row-g-3">
    <div class="col col-span-4 col-offset-2"><div class="bg-amber-100 p-2 rounded">span 4, offset 2</div></div>
    <div class="col col-span-4"><div class="bg-amber-100 p-2 rounded">span 4</div></div>
  </div>
  <div class="row row-g-3">
    <div class="col col-span-4 col-order-last"><div class="bg-red-100 p-2 rounded">first in source, last visually</div></div>
    <div class="col col-span-4"><div class="bg-red-100 p-2 rounded">B</div></div>
    <div class="col col-span-4"><div class="bg-red-100 p-2 rounded">C</div></div>
  </div>
</div>
:::

</template>

<template #usage>

```html
<div class="row row-g-3">
  <div class="col col-span-12 md:col-span-6 lg:col-span-4">
    <article class="bg-white p-4 rounded shadow-sm">A</article>
  </div>
  <div class="col col-span-12 md:col-span-6 lg:col-span-4">
    <article class="bg-white p-4 rounded shadow-sm">B</article>
  </div>
  <div class="col col-span-12 md:col-span-6 lg:col-span-4">
    <article class="bg-white p-4 rounded shadow-sm">C</article>
  </div>
</div>
```

</template>

</RecipeTabs>
