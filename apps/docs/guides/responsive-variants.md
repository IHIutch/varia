# Responsive variants

Register a definition with size and busy variants:

```ts
import { defineComponent } from 'variacss'

export default defineComponent('notice', {
  base: 'rounded border border-gray-200',
  variants: {
    size: { sm: 'p-2 text-sm', lg: 'p-6 text-lg' },
    busy: 'opacity-50',
  },
  compoundVariants: [
    { when: { size: 'lg', busy: true }, class: 'p-8' },
  ],
})
```

Use Tailwind modifiers on component classes:

```html
<div class="notice notice-size-sm md:notice-size-lg">Saved</div>
```

The notice is small below `md` and large above it. Breakpoints come from your [Tailwind theme](https://tailwindcss.com/docs/responsive-design).

## Responsive compounds

```html
<div class="notice notice-size-sm md:notice-size-lg notice-busy">Saving</div>
```

The compound applies `p-8` at `md` and above. `size` is first in `when`, so its class accepts the modifier; the other condition requires bare `notice-busy`.

Using `md:notice-size-lg md:notice-busy` applies both individual variants but does not match the compound. To modify busy instead, put it first:

```ts
{ when: { busy: true, size: 'lg' }, class: 'p-8' }
```

Then use `notice notice-size-lg md:notice-busy`. For independently responsive conditions, put responsive utilities in the expansion or write explicit CSS.
