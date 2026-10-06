# Avatar

An avatar with CSS custom properties for background, text, and ring colors. Each property has a `theme()` fallback, so consumers can override individual colors in CSS.

Use the [Button recipe](/recipes/button) for explicit color and style variants. See [Theming](/theming) for inherited theme tokens and automatic dark mode.

## Authoring

```ts
// recipes/avatar.config.ts
import { defineComponent } from 'varia'

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

The background utility uses a CSS variable with a palette fallback:

```text
bg-[var(--avatar-bg,theme(colors.gray.200))]
   └── arbitrary-value utility
       └── var() with fallback
           ├── --avatar-bg (consumer's override hook)
           └── theme(colors.gray.200) (your design-system default)
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

## Consumption (defaults)

```html
<span class="avatar avatar-s-md">JB</span>
<span class="avatar avatar-s-lg avatar-ring">VA</span>
```

## Re-theming without forking

Set the variables globally or on an ancestor of the avatar:

```css
/* App-wide brand override */
:root {
  --avatar-bg: oklch(0.7 0.15 60);   /* warm peach */
  --avatar-fg: oklch(0.2 0.05 60);   /* deep brown */
  --avatar-ring: oklch(0.95 0.02 60);
}

/* Or scoped to a component */
.team-card {
  --avatar-bg: oklch(0.55 0.2 250);
  --avatar-fg: white;
}
```

The browser applies these overrides without changing the Varia definition or regenerating its shortcuts.

## Generated class names

| Class | Purpose |
|---|---|
| `avatar` | Base styling, theming hooks |
| `avatar-s-sm` / `-md` / `-lg` / `-xl` | Size scale |
| `avatar-ring` | Adds offset ring around the image (also themable) |

## When to use this pattern

Use `var(--token, theme(...))` when consumers need CSS overrides and a default value. Document the variable name and its fallback.
