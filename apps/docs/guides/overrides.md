# Overrides

A Tailwind utility overrides normal component declarations:

```html
<button class="btn btn-size-lg px-8">Save</button>
```

`px-8` wins over padding in the base, variants, or compounds. Keep `variacss/tailwind.css` imported before `tailwindcss`. It establishes these sublayers inside Tailwind's utilities layer:

```text
varia.base < varia.variants < varia.compounds < native utilities
```

This also lets utilities on a slot override ancestor slot rules. Explicit `!important` declarations reverse layer priority. Within a layer, Tailwind's utility ordering and CSS precedence determine conflicts; Varia does not select a winner. Class attribute order has no effect.

## Reuse a component in CSS

In a stylesheet that loads Varia:

```css
@layer utilities {
  .checkout-action {
    @apply btn;
  }
}
```

Use `checkout-action btn-size-lg` to keep the size selectable. For separate component stylesheets, follow Tailwind's [`@reference` documentation](https://tailwindcss.com/docs/functions-and-directives#reference-directive).
