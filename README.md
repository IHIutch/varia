# varia

On-demand CSS with the ergonomics of regular CSS classes.

Varia lets you define component styles with utility classes, then use readable classes such as `btn btn-c-primary btn-s-lg` in your markup. Tailwind CSS generates the CSS at build time; Varia adds no styling runtime to your application.

```ts
import { defineComponent } from 'varia'

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

Register the definition with `tailwindVaria` in a Tailwind v4 plugin module. Tailwind scans your source files and emits CSS for the component and variant classes it finds. A slot-keyed variant emits its slot rules when its variant class is used. A compound emits when the class for its first `when` condition is used; the combined selector checks the remaining conditions in the browser. Unused components and activation classes produce no component CSS.

## Why Varia

- Define shared styles once and select variants with ordinary CSS classes.
- Keep class names readable, searchable, and available to your own CSS selectors.
- Generate component CSS on demand rather than shipping a complete component stylesheet.
- Use the same classes in HTML, JSX, Rails ERB, Phoenix HEEx, Liquid, or other templates.
- Describe multi-element components with slots and combinations of variants with compound rules.
- Generate optional TypeScript class types for checking component class strings.

Varia is a tool for authoring component styles. The [recipes](recipes) are examples you can adapt for your own design system. Interactive behavior, markup, and accessibility remain part of your application or component framework.

## Work on this repository

Use Node.js 22 or newer and pnpm.

```sh
pnpm install
```

Run `pnpm build` followed by `pnpm example:dev` for the Tailwind kitchen-sink demo, or `pnpm example:dev:unocss` for the same demo with UnoCSS. `pnpm example:build` and `pnpm example:build:unocss` create production builds.

This branch holds the Tailwind adapter and a minimal UnoCSS adapter to the same contract (`packages/varia/test/contract.test.ts`) for comparison.

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

The library lives in `packages/varia`, example style definitions in `recipes`, and the demo in `examples/kitchen-sink`.
