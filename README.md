# varia

On-demand CSS with the ergonomics of regular CSS classes.

Varia lets you define component styles with utility classes, then use readable classes such as `btn btn-c-primary btn-s-lg` in your markup. Tailwind generates the CSS at build time; Varia adds no styling runtime to your application.

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

Register definitions with `tailwindVaria` from `varia/tailwind`. Tailwind scans your source files and emits CSS for component and variant classes it finds. A slot-keyed variant emits its slot rules when its variant class is used. A compound emits when the class for its first `when` condition is used; the combined selector checks the remaining conditions in the browser. Unused components and activation classes produce no component CSS. See [the v1 public contract](API.md) for supported exports, definition shapes, responsive compounds, nested slots, types, and compatibility expectations.

## Why Varia

- Define shared styles once and select variants with ordinary CSS classes.
- Keep class names readable, searchable, and available to your own CSS selectors.
- Generate component CSS on demand rather than shipping a complete component stylesheet.
- Use the same classes in HTML, JSX, Rails ERB, Phoenix HEEx, Liquid, or other templates.
- Describe multi-element components with slots and combinations of variants with compound rules.
- Generate optional TypeScript class types for checking component class strings.

Varia is a tool for authoring component styles. The [recipes](recipes) are examples you can adapt for your own design system. Interactive behavior, markup, and accessibility remain part of your application or component framework.

## Work on this repository

Use Node.js 26 and pnpm 10.25.0. Typechecking uses TypeScript 7.

```sh
pnpm install
```

This checkout contains the Tailwind implementation, including the grid and strict class-type extensions. Use `pnpm build`, `pnpm test`, `pnpm example:dev`, and `pnpm example:build`. The [engine comparison](COMPARISON.md) records earlier branch experiments; [API.md](API.md) defines current behavior.

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm test:visual
pnpm test:reload
pnpm test:editor
pnpm release:prepare
```

The library lives in `packages/varia`, example style definitions in `recipes`, and the demo in `examples/kitchen-sink`.

`pnpm release:prepare` verifies an actual packed archive in clean standalone and monorepo consumers before writing it to `.release/`. See [release preparation and compatibility](API.md#release-preparation) for the version/OS matrix and release gates.

## Editor autocomplete

Use Tailwind CSS IntelliSense for Varia classes in ordinary markup and existing helpers such as `clsx`. The example's responsive grid uses plain class strings and disables manifest generation. See [editor support](API.md#editor-support) for settings, imported-recipe refresh, and troubleshooting. Unknown-class linting in markup is not a native extension rule.

The existing `varia/types` export is [optional TypeScript tooling](API.md#strict-class-types); it is not needed for autocomplete.

## Native Tailwind expansion

Recipes may use Tailwind's themes, custom utilities, arbitrary values, and individual modifiers. Tailwind's Vite integration processes authored CSS and native `@apply` directly. The downstream test verifies authored CSS and component application in a real consumer build. See [the contract](API.md#cascade-and-prefixes) for ordering and prefix behavior.

## Development reload

With `@tailwindcss/vite`, import your recipe registration config in `vite.config.ts` and set `server.warmup.clientFiles` to your CSS entry. Vite watches imported recipes and shared helpers, restarts after edits, and recovers when invalid edits in a running session are fixed. Warmup regenerates types before a browser opens.

See [Vite development reload](API.md#vite-development-reload) for the full configuration and supported paths.
