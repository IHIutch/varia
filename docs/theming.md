# Theming

Varia uses Tailwind's theme and ordinary CSS variables. Follow Tailwind's [theme variables documentation](https://tailwindcss.com/docs/theme) for configuration.

## Shared tokens

```css
@theme {
  --color-brand: #2563eb;
}
```

Use `bg-brand` in a definition just as you would in markup. Updating the token updates the component's color.

## Consumer overrides

A utility such as `bg-brand` overrides a component background. For an explicit override hook, read a custom property in the definition:

```ts
const button = defineComponent('brand-btn', {
  base: 'rounded px-4 py-2 bg-[var(--brand-bg,var(--color-blue-600))] text-[color:var(--brand-fg,white)]',
})
```

Set variables on the element or an ancestor:

```css
.brand-danger {
  --brand-bg: var(--color-red-600);
  --brand-fg: white;
}
```

```html
<section class="brand-danger">
  <button class="brand-btn">Delete</button>
</section>
```

Use `@theme static` for Tailwind tokens referenced only by custom CSS, so they are emitted without a utility reference.
