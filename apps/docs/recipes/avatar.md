# Avatar

Size variants and an optional ring, with CSS variables for color overrides. [Full definition](https://github.com/IHIutch/varia/blob/main/recipes/avatar.config.ts).

## Authoring

```ts
// recipes/avatar.config.ts
import { defineComponent } from 'variacss'

export default defineComponent('avatar', {
  base: 'inline-flex items-center justify-center rounded-full overflow-hidden bg-[var(--avatar-bg,theme(colors.gray.200))] text-[var(--avatar-fg,theme(colors.gray.700))] font-medium select-none',
  variants: {
    s: {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-14 h-14 text-base',
      xl: 'w-20 h-20 text-lg',
    },
    ring: 'ring-2 ring-[var(--avatar-ring,theme(colors.white))] ring-offset-2 ring-offset-[var(--avatar-ring-offset,theme(colors.gray.100))]',
  },
})
```

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 flex flex-wrap items-end gap-4">
  <span class="avatar avatar-s-sm">JB</span>
  <span class="avatar avatar-s-md">VA</span>
  <span class="avatar avatar-s-lg avatar-ring">RP</span>
  <span class="avatar avatar-s-xl">AC</span>
</div>

<div class="my-6 p-6 border border-gray-200 rounded-md" style="--avatar-bg: oklch(0.7 0.15 60); --avatar-fg: oklch(0.2 0.05 60); --avatar-ring: oklch(0.95 0.02 60); background: oklch(0.97 0.01 60);">
  <p class="mb-3 text-sm text-gray-700">Re-themed via CSS custom properties (warm peach):</p>
  <div class="flex flex-wrap items-end gap-4">
    <span class="avatar avatar-s-md">JB</span>
    <span class="avatar avatar-s-lg avatar-ring">VA</span>
    <span class="avatar avatar-s-xl">RP</span>
  </div>
</div>
:::

## Usage

```html
<span class="avatar avatar-s-md">JB</span>
<span class="avatar avatar-s-lg avatar-ring"
      style="--avatar-bg: rebeccapurple; --avatar-fg: white">VA</span>
```

Set `--avatar-bg`, `--avatar-fg`, `--avatar-ring`, and `--avatar-ring-offset` on the element or an ancestor. Each has a palette fallback in the definition; overrides need no rebuild.
