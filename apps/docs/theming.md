# Theming

Varia resolves utility strings against Tailwind's theme. Use explicit variant classes for component choices, `@theme` for shared design tokens, or inherited CSS custom properties for subtree themes.

## Shared Tailwind tokens

Declare tokens in your stylesheet:

```css
@theme {
  --color-brand: #2563eb;
}
```

Use the resulting utilities in a definition:

```ts
const button = defineComponent('btn', {
  base: 'inline-flex rounded-md',
  variants: {
    c: { brand: 'bg-brand text-white' },
  },
})
```

Tailwind resolves `bg-brand` through `@apply`. Updating the token updates component styles that reference it.

## Explicit component choices

The [Button recipe](/recipes/button) uses color and style variants with compound rules. `btn-c-primary btn-style-solid` selects blue background and border utilities. Changing a palette means editing the corresponding utility strings.

Use this pattern when each component chooses its own color and style.

## Override one component

Ordinary Tailwind utilities override Varia bases, variants, and compounds:

```html
<button class="btn btn-c-primary btn-style-solid bg-brand">Save</button>
```

For values consumers need to control directly, expose custom properties as the [Avatar recipe](/recipes/avatar) does:

```html
<span class="avatar avatar-s-md" style="--avatar-bg: rebeccapurple; --avatar-fg: white">JC</span>
```

## Inherited subtree themes

Have definitions read shared CSS variables, with fallbacks for use outside a wrapper:

```ts
const button = defineComponent('brand-btn', {
  base: 'inline-flex rounded-md bg-[var(--brand-bg,var(--color-blue-600))] text-[color:var(--brand-fg,white)]',
  variants: { s: { md: 'px-4 py-2' } },
})
```

Declare a theme class in CSS:

```css
@layer components {
  .brand-danger {
    --brand-bg: var(--color-red-600);
    --brand-fg: white;
  }
}
```

Components reading those variables inherit the wrapper's theme:

```html
<section class="brand-danger">
  <button class="brand-btn brand-btn-s-md">Delete</button>
</section>
```

Tailwind's theme variables remain available to CSS. If a token is referenced only by custom CSS, declare it with `@theme static` so it is emitted even when no utility references it.

## Dark mode

Use Tailwind's `dark:` variants in utility strings, or switch inherited variables with a media query. CSS `light-dark()` is another option when the themed subtree declares `color-scheme: light dark`.

Varia supplies no separate theme system. Theme behavior follows Tailwind utilities and the CSS variables used by your definitions.
