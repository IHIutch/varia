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

The notice is small below `md` and large at `md` and above. Breakpoints come from your [Tailwind theme](https://tailwindcss.com/docs/responsive-design).

## Responsive compounds

```html
<div class="notice notice-size-sm md:notice-size-lg notice-busy">Saving</div>
```

The compound applies `p-8` at `md` and above. Because `size` is first in `when`, apply the modifier to its class. Keep `notice-busy` on the same element without a modifier.

Using `md:notice-size-lg md:notice-busy` applies both individual variants but does not match the compound. To modify busy instead, put it first:

```ts
{ when: { busy: true, size: 'lg' }, class: 'p-8' }
```

Then use `notice notice-size-lg md:notice-busy`. To make each condition respond to a different breakpoint, write explicit CSS. You can also put responsive utilities in the compound's `class` value when the condition classes themselves do not need modifiers.
