# Form input

State and size variants, with native focus, disabled, placeholder, and read-only styles. [Full definition](https://github.com/IHIutch/varia/blob/main/recipes/form-input.config.ts).

## Authoring

```ts
// recipes/form-input.config.ts
import { defineComponent } from 'variacss'

export default defineComponent('form-input', {
  base: 'block w-full rounded-md border bg-white px-3 py-2 text-base shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
  variants: {
    state: {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-500 text-red-700 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500 invalid:border-red-500',
      success: 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500',
    },
    s: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    },
    readonly: 'read-only:bg-gray-50 read-only:cursor-default',
  },
})
```

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 grid gap-3 w-full">
  <input class="form-input form-input-state-default form-input-s-md" placeholder="Default state" />
  <input class="form-input form-input-state-error form-input-s-md" placeholder="Error state" aria-invalid="true" />
  <input class="form-input form-input-state-success form-input-s-md" placeholder="Success state" />
  <input class="form-input form-input-state-default form-input-s-sm" placeholder="Small" />
  <input class="form-input form-input-state-default form-input-s-lg" placeholder="Large" />
  <input class="form-input form-input-state-default form-input-s-md form-input-readonly" readonly value="cannot edit" />
  <input class="form-input form-input-state-default form-input-s-md" placeholder="Disabled" disabled />
</div>
:::

## Usage

```html
<input class="form-input form-input-state-default form-input-s-md" />
<input class="form-input form-input-state-error form-input-s-md" aria-invalid="true" />
<input class="form-input form-input-state-default form-input-s-md form-input-readonly"
       readonly value="cannot edit" />
```

The `state` variant controls appearance; your application handles validation. The `readonly` variant enables styles gated by the input's `readonly` attribute.
