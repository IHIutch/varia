# Form input

The pseudo-class stress test. Form inputs live and die by their `:focus`, `:disabled`, `:invalid`, `:placeholder`, and `:read-only` styling. This recipe puts all of them inside variant expansions and verifies they pass straight through to UnoCSS.

## Authoring

```ts
// recipes/form-input.config.ts
import { defineComponent } from 'varia'

export default defineComponent('form-input', {
  base: 'block w-full rounded-md border bg-white px-3 py-2 text-base shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
  variants: {
    state: {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error:   'border-red-500 text-red-700 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500 invalid:border-red-500',
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

Every state-driven style lives next to the value it modifies:

- `placeholder:text-gray-400` in `base` styles the placeholder uniformly.
- `invalid:border-red-500` only inside the `error` state expansion. The consumer opts in by writing `form-input-state-error`.
- `read-only:` utilities only emit when the consumer adds `form-input-readonly` to the element.

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

## What's being demonstrated

- Pseudo-classes inside variant expansions survive the shortcut layer untouched. UnoCSS sees `placeholder:text-gray-400` in the resolved expansion and produces `::placeholder { color: ... }`; `varia` doesn't need to understand any of it.
- Layered states: `:focus` (intentional), `:disabled` (declarative), `:invalid` (validation-driven), `:read-only` (data-driven), `::placeholder` (typographic). Each lives in the variant where it makes sense.
- State as a multi-value variant is a useful pattern for mutually-exclusive visual modes. Using `state-default` / `state-error` / `state-success` keeps the markup explicit and grep-able. Reach for it whenever a component has three or more ways of looking the same.

## Generated class names

| Class | Purpose |
|---|---|
| `form-input` | Base input styling, including `:focus`, `:disabled`, `::placeholder` |
| `form-input-state-default` / `-error` / `-success` | Visual mode |
| `form-input-s-sm` / `-md` / `-lg` | Size |
| `form-input-readonly` | Toggles `:read-only` styling |

## See also

- [Button recipe](/recipes/button): same state philosophy applied to a different surface.
- [Naming convention](/naming): formal rules for assembled class names.
