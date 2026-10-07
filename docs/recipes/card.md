# Card

## Recipe

<<< ../../recipes/card.config.ts

## Usage

<RecipeTabs>

<template #preview>

:::raw
<div class="my-6">
  <article class="card max-w-md">
    <header class="p-4 border-b border-gray-200">
      <h3 class="font-medium">Card title</h3>
    </header>
    <div class="p-4 text-gray-700">
      <p>Card body</p>
    </div>
  </article>
</div>
:::

</template>

<template #usage>

```html
<article class="card">
  <header class="p-4 border-b border-gray-200">
    <h3 class="font-medium">Card title</h3>
  </header>

  <div class="p-4">
    <p>Card body</p>
  </div>
</article>
```

</template>

</RecipeTabs>
