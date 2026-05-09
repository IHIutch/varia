# Spinner

The animation regression. Anything that depends on `@keyframes` is at risk in a build pipeline that doesn't understand them. This recipe verifies that UnoCSS's `animate-spin` (and the keyframes it requires) survives the shortcut layer untouched.

## Authoring

```ts
// recipes/spinner.config.ts
import { defineComponent } from 'varia'

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
      muted:   'text-gray-400',
      danger:  'text-red-600',
    },
  },
})
```

A CSS-only spinner is a circle with a transparent right border that rotates. UnoCSS's `animate-spin` injects `@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }` into the generated CSS automatically, whenever any `animate-spin` class is referenced anywhere.

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 flex flex-wrap items-center gap-6">
  <span class="spinner spinner-s-sm spinner-c-primary"></span>
  <span class="spinner spinner-s-md spinner-c-primary"></span>
  <span class="spinner spinner-s-lg spinner-c-primary"></span>
  <span class="spinner spinner-s-md spinner-c-muted"></span>
  <span class="spinner spinner-s-md spinner-c-danger"></span>
  <button class="btn btn-c-primary btn-s-md" disabled>
    <span class="spinner spinner-s-sm" style="color: currentColor"></span>
    Saving…
  </button>
</div>
:::

## Consumption

```html
<div role="status" aria-label="Loading">
  <span class="spinner spinner-s-md spinner-c-primary"></span>
</div>

<button class="btn btn-c-primary btn-s-md" disabled>
  <span class="spinner spinner-s-sm spinner-c-muted"></span>
  Saving…
</button>
```

## What's being demonstrated

- `@keyframes` definitions are emitted by UnoCSS at the top level of the stylesheet, not inside any shortcut rule. `varia` doesn't need to do anything special; the keyframes show up because `animate-spin` is referenced.
- Two multi-value variants that compose orthogonally (`s` times `c` gives nine useful combinations from six expansions).
- No boolean variants here. A spinner doesn't have an obvious on/off axis.

## Generated class names

| Class | Purpose |
|---|---|
| `spinner` | Base + `animate-spin` (keyframes injected by UnoCSS) |
| `spinner-s-sm` / `-md` / `-lg` | Size + border thickness |
| `spinner-c-primary` / `-muted` / `-danger` | Color (via `currentColor` on the border) |
