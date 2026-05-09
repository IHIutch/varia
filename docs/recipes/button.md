# Button

The canonical recipe. A button looks simple until you remember it has hover, focus-visible, active, disabled, and pressed states; needs to support multiple sizes, color schemes, and an outline variant; and should be accessible by default. That's the territory `varia` is built for.

## Authoring

```ts
// recipes/button.config.ts
import { defineComponent } from 'varia'

export default defineComponent('btn', {
  base: 'inline-block font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    c: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500',
      danger:  'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500',
      ghost:   'bg-transparent text-gray-900 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400',
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
    outline: 'bg-transparent border-2 hover:bg-current/10',
    block:   'block w-full',
  },
})
```

## Live preview

:::raw
<div class="flex flex-wrap items-center gap-3 my-6 p-6 border border-gray-200 rounded-md bg-gray-50">
  <button class="btn btn-c-primary btn-s-md">Save</button>
  <button class="btn btn-c-danger btn-s-sm btn-outline">Delete</button>
  <button class="btn btn-c-ghost btn-s-md" disabled>Loading…</button>
</div>

<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50">
  <button class="btn btn-c-success btn-s-lg btn-block">Sign up</button>
</div>
:::

## Consumption

```html
<button class="btn btn-c-primary btn-s-md">Save</button>
<button class="btn btn-c-danger btn-s-sm btn-outline">Delete</button>
<button class="btn btn-c-success btn-s-lg btn-block">Sign up</button>
<button class="btn btn-c-ghost btn-s-md" disabled>Loading…</button>
```

The state-handling utilities (`hover:`, `focus-visible:`, `active:`, `disabled:`) live inside the variant expansions. The consumer never types them; they get the right behavior from a single semantic class.

## What's being demonstrated

This recipe exercises the design across several dimensions at once:

- Multi-value variants: `c` (4 colors) and `s` (3 sizes).
- Boolean variants: `outline`, `block`.
- Pseudo-class handling: `hover:`, `active:`, `focus-visible:`, `disabled:` all pass through to UnoCSS without `varia` needing to know they exist.
- Multiple variants composing: `btn-c-primary` plus `btn-s-lg` plus `btn-outline` resolve independently and stack cleanly.

## Generated class names

| Class | Purpose |
|---|---|
| `btn` | Base button styling (state-aware) |
| `btn-c-primary` / `-danger` / `-success` / `-ghost` | Color schemes |
| `btn-s-sm` / `-md` / `-lg` | Sizes |
| `btn-outline` | Toggles outlined treatment |
| `btn-block` | Full-width layout |

Eleven classes. Consumers pay for what they use.
