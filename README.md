# varia

On-demand CSS with the ergonomics of regular CSS classes.

Varia lets you define component styles with utility classes, then use readable classes such as `btn btn-c-primary btn-s-lg` in your markup. Tailwind generates the CSS at build time; Varia adds no styling runtime to your application.

```ts
import { defineComponent } from 'variacss'

export default defineComponent('btn', {
  base: 'inline-flex items-center rounded font-medium',
  variants: {
    c: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    s: {
      sm: 'px-2 py-1 text-sm',
      lg: 'px-4 py-2 text-lg',
    },
  },
})
```

```html
<button class="btn btn-c-primary btn-s-lg">Save</button>
```

Register definitions with `tailwindVaria` from `variacss/tailwind`. Tailwind scans your source files and emits CSS for component and variant classes it finds. A slot-keyed variant emits its slot rules when its variant class is used. A compound emits when the class for its first `when` condition is used; the combined selector checks the remaining conditions in the browser. Unused components and activation classes produce no component CSS. See [the documentation](https://github.com/IHIutch/varia/tree/main/apps/docs) for supported exports, definition shapes, responsive compounds, nested slots, and compatibility expectations.

## Why Varia

- Define shared styles once and select variants with ordinary CSS classes.
- Keep class names readable, searchable, and available to your own CSS selectors.
- Generate component CSS on demand rather than shipping a complete component stylesheet.
- Use the same classes in HTML, JSX, Rails ERB, Phoenix HEEx, Liquid, or other templates.
- Describe multi-element components with slots and combinations of variants with compound rules.

Varia is a tool for authoring component styles. The [recipes](https://github.com/IHIutch/varia/tree/main/recipes) are examples you can adapt for your own design system. Interactive behavior, markup, and accessibility remain part of your application or component framework.

## Start here

```sh
npm install variacss
```

Use Node.js 26 or newer and a Tailwind 4 integration. The complete Vite walkthrough uses Tailwind 4.3.3 and Vite 8.3.2.

- [Build your first component style](https://github.com/IHIutch/varia/blob/main/apps/docs/quickstart.md) with a complete standalone Vite walkthrough.
- [Integrate with an existing Tailwind project](https://github.com/IHIutch/varia/blob/main/apps/docs/tailwind.md).
- [Understand the styling model](https://github.com/IHIutch/varia/blob/main/apps/docs/concepts.md).
- [Browse the documentation](https://github.com/IHIutch/varia/blob/main/apps/docs/documentation.md) for task guides, reference, and recipes with live previews.

## Work on this repository

See [Contributing](https://github.com/IHIutch/varia/blob/main/CONTRIBUTING.md) for checkout setup, verification commands, and the VitePress documentation site.

```sh
pnpm install
pnpm docs:dev
```

The site lives in `apps/docs`. Run `pnpm docs:build` for static output or `pnpm docs:preview` to inspect the built site. See [compatibility](https://github.com/IHIutch/varia/blob/main/apps/docs/reference/compatibility.md) for the limits of current checks.
