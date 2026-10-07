# Card

The `card` class styles the outer container. Use utilities for its contents.

## Recipe

<<< ../../recipes/card.config.ts

## Live preview

:::raw
<div class="my-6">
  <article class="card max-w-md">
    <header class="p-4 border-b border-gray-200">
      <h3 class="font-medium">Card title</h3>
    </header>
    <div class="p-4 text-gray-700">
      <p>Card body. The <code class="px-1 bg-gray-100 rounded text-sm">.card</code> class only handles the outer container; padding inside is the consumer's choice.</p>
    </div>
  </article>
</div>
:::

## Usage

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

The header and body use utilities. Add slots if those styles repeat across cards.
