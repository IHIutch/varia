# Responsive variants

Use this guide to change a component's size responsively or apply a rule when two variants are active together. Start with [a working integration](/tailwind).

## Define the variants

Create and register this definition:

```ts
import { defineComponent } from 'variacss'

export default defineComponent('notice', {
  base: 'rounded border border-gray-200',
  variants: {
    size: {
      sm: 'p-2 text-sm',
      lg: 'p-6 text-lg',
    },
    busy: 'opacity-50',
  },
  compoundVariants: [
    { when: { size: 'lg', busy: true }, class: 'p-8' },
  ],
})
```

Add the factory output to your `tailwindVaria({ components: [...] })` array and let Vite restart.

## Change size responsively

Use this markup in a scanned template:

```html
<div class="notice notice-size-sm md:notice-size-lg">Saved</div>
```

With Tailwind's default theme, the notice has small padding and text below `md`, then larger padding and text at `md` and above. The breakpoint comes from your Tailwind theme.

Use complete literal names, including `md:notice-size-lg`. Do not construct the class name by joining a prefix and size at runtime.

## Apply the compound above the breakpoint

Add the bare busy class:

```html
<div class="notice notice-size-sm md:notice-size-lg notice-busy">Saving</div>
```

At `md` and above, the compound changes the padding to `p-8`. Below `md`, the small padding remains. `notice-busy` applies opacity at all sizes. Your application must communicate loading status and manage interaction as needed; the class only changes styling.

The first `when` entry is `size`. Its activation class can receive a modifier such as `md:`. The remaining `busy` condition must be present as the exact bare `notice-busy` class on the same element.

## Avoid independently modified compound conditions

This markup does not activate the compound, even above `md`:

```html
<div class="notice md:notice-size-lg md:notice-busy">Saving</div>
```

Both individual variants still work. The compound requires bare `notice-busy`, not `md:notice-busy`.

If you need the busy condition modified instead, change the compound to:

```ts
{ when: { busy: true, size: 'lg' }, class: 'p-8' }
```

Then use `notice notice-size-lg md:notice-busy`. The large size applies at all viewports; the compound applies at `md` and above. For independently responsive conditions, put responsive rules in the definition's expansion or author explicit CSS.

Compounds add no class of their own. Keep the order of `when` entries intentional. See [the compound reference](/naming#responsive-compound-conditions) for accepted shapes and the full matching table.
