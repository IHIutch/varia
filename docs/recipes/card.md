# Card

The minimum viable component. A `Card` is a base-styled container with no variants. The point of this recipe is showing that the API doesn't fight you when you have nothing to vary.

## Authoring

```ts
// recipes/card.config.ts
import { defineComponent } from 'varia'

export default defineComponent('card', {
  base: 'block rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden',
})
```

No `variants` block. `defineComponent` accepts this; `base` alone is a valid component. The generated manifest contains a single class name: `card`.

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

## Consumption

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

The header and body styling are plain utilities, not part of the `card` component's vocabulary. If you find yourself using the same header pattern across many cards, that's the moment to introduce a sibling component (`card-header`) using the multi-component pattern from the [Dropdown recipe](/recipes/dropdown).

## What's being demonstrated

- A `defineComponent` call with only a `base` field is valid.
- No variants means no extra class names; the manifest stays minimal.
- The library doesn't push you toward synthetic complexity. If a component is a single CSS string, treat it as one.

## When to add variants

You don't need them yet, but watch for:

- Two or more callers manually overriding the same property (`bg-blue-50`, `bg-amber-50`); that's a candidate for `c: { … }`.
- A pattern emerging where you compose `card` with `border-2 border-blue-500` for an accent; that's an `accent: '…'` boolean variant waiting to happen.
- More than three of these and you're growing into the [Button recipe's](/recipes/button) shape.
