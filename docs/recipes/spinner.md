# Spinner

Size and color variants around Tailwind's `animate-spin`. [Full definition](https://github.com/IHIutch/varia/blob/main/recipes/spinner.config.ts).

## Authoring

```ts
// recipes/spinner.config.ts
import { defineComponent } from 'variacss'

export default defineComponent('spinner', {
  base: 'inline-block rounded-full border-current border-solid animate-spin',
  variants: {
    s: {
      sm: 'w-4 h-4 border-2 border-r-transparent',
      md: 'w-6 h-6 border-2 border-r-transparent',
      lg: 'w-10 h-10 border-4 border-r-transparent',
    },
    c: {
      primary: 'text-blue-600',
      muted: 'text-gray-400',
      danger: 'text-red-600',
    },
  },
})
```

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 flex flex-wrap items-center gap-6">
  <span class="spinner spinner-s-sm spinner-c-primary"></span>
  <span class="spinner spinner-s-md spinner-c-primary"></span>
  <span class="spinner spinner-s-lg spinner-c-primary"></span>
  <span class="spinner spinner-s-md spinner-c-muted"></span>
  <span class="spinner spinner-s-md spinner-c-danger"></span>
  <button class="btn btn-c-primary btn-style-solid btn-s-md" disabled>
    <span class="spinner spinner-s-sm" style="color: currentColor"></span>
    Saving...
  </button>
</div>
:::

## Usage

```html
<div role="status" aria-label="Loading">
  <span class="spinner spinner-s-md spinner-c-primary"></span>
</div>
```

The border inherits `currentColor`. Omit the color variant to inherit a parent color. Tailwind supplies the animation keyframes.
