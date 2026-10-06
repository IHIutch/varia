# varia

On-demand CSS with the ergonomics of regular CSS classes.

Varia lets you define component styles with UnoCSS utilities, then use readable classes such as `btn btn-c-primary btn-s-lg` in your markup. You get Tailwind-style just-in-time CSS generation without repeating utility lists on every element. UnoCSS generates the CSS at build time; Varia adds no styling runtime to your application.

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

Register the definition with `presetVaria` in your UnoCSS config. UnoCSS scans your source files and emits CSS for the component and variant shortcuts it finds. Unused shortcuts stay out of the stylesheet. Compound variants and variants that target named parts currently emit CSS for every registered rule, even if unused.

## Why Varia

- Define shared styles once and select variants with ordinary CSS classes.
- Keep class names readable, searchable, and available to your own CSS selectors.
- Generate shortcut CSS on demand rather than shipping a complete component stylesheet.
- Use the same classes in HTML, JSX, Rails ERB, Phoenix HEEx, Liquid, or other templates.
- Describe multi-element components with slots and combinations of variants with compound rules.
- Get class completion through the UnoCSS VS Code extension, with optional generated TypeScript class types.

Varia is a tool for authoring component styles. The [recipes](apps/docs/recipes/button.md) are examples you can adapt for your own design system. Interactive behavior, markup, and accessibility remain part of your application or component framework.

## Get started

Follow the [quickstart](apps/docs/quickstart.md) to install Varia, define a button, and connect it to UnoCSS. An existing UnoCSS integration is required to scan templates and load the generated stylesheet.

- [Concepts](apps/docs/concepts.md): how definitions become classes and CSS.
- [API reference](apps/docs/api.md): variants, slots, compound rules, and class types.
- [Comparison](apps/docs/comparison.md): when to use Varia.
- [Theming](apps/docs/theming.md): component overrides and shared CSS variables.

## Work on this repository

Use Node.js 22 or newer and pnpm.

```sh
pnpm install
pnpm docs:dev
```

Run `pnpm example:dev` for the kitchen-sink demo.

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm docs:build
```

The library lives in `packages/varia`, documentation in `apps/docs`, example style definitions in `recipes`, and the demo in `examples/kitchen-sink`.
