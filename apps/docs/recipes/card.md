# Card

A container with base styles and no variants. `base` alone is a valid component definition.

## Authoring

```ts
// recipes/card.config.ts
import { defineComponent } from 'varia'

export default defineComponent('card', {
  base: 'block rounded-lg border border-gray-200 bg-white shadow-sm',
})
```

The generated manifest contains one class name, `card`.

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

The header and body use utilities directly. If you repeat those styles across cards, define `header`, `body`, and `footer` slots. See the [Modal recipe](/recipes/modal).

## When to add variants

Add variants when multiple uses need the same alternatives:

- Repeated background overrides, such as `bg-blue-50` and `bg-amber-50`, can become a color variant.
- A repeated accent border can become a boolean variant such as `accent`.

See the [Button recipe](/recipes/button) for a component with several variant axes.
