# Form input

A form input with focus, disabled, invalid, placeholder, and read-only styles. State utilities can appear in base styles or variant definitions.

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

This recipe groups state styles with their base or variant:

- `placeholder:text-gray-400` in `base` sets the placeholder color.
- `form-input-state-error` includes `invalid:border-red-500`, which applies when the input is invalid.
- `form-input-readonly` includes read-only utilities, which apply when the input has the `readonly` attribute.

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

## Consumption

```html
<input class="form-input form-input-state-default form-input-s-md" />

<input class="form-input form-input-state-error form-input-s-md"
       aria-invalid="true" />

<input class="form-input form-input-state-default form-input-s-lg form-input-readonly"
       readonly value="cannot edit" />

<input class="form-input form-input-state-default form-input-s-md" disabled />
```

## Generated class names

| Class | Purpose |
|---|---|
| `form-input` | Base input styling, including `:focus`, `:disabled`, `::placeholder` |
| `form-input-state-default` / `-error` / `-success` | Visual mode |
| `form-input-s-sm` / `-md` / `-lg` | Size |
| `form-input-readonly` | Toggles `:read-only` styling |

