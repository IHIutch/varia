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

Varia is a tool for authoring component styles. The [recipes](https://github.com/IHIutch/varia/tree/main/recipes) are examples you can adapt for your own design system. Interactive behavior, markup, and accessibility remain part of your application or component framework.

## Install with Tailwind and Vite

Use Node.js 26 or newer. This example uses Tailwind 4.3.3 and Vite 8.0.16.

```sh
mkdir varia-app
cd varia-app
npm init -y
npm pkg set type=module scripts.dev=vite scripts.build="vite build"
npm install varia@1.0.0 tailwindcss@4.3.3
npm install -D vite@8.0.16 @tailwindcss/vite@4.3.3
```

For an unpublished checkout, replace `varia@1.0.0` with the absolute path to the verified `.release/varia-1.0.0.tgz` archive.

Create `recipes.ts` using only public exports:

```ts
import { defineComponent } from 'varia'

export const components = [
  defineComponent('card', {
    slots: { root: 'rounded border p-4', title: 'font-semibold' },
    variants: { accent: { title: 'text-blue-600' } },
  }),
  defineComponent('row', { base: 'flex flex-wrap' }),
  defineComponent('col', {
    base: 'w-full',
    variants: { span: { half: 'w-1/2' } },
  }),
]
```

Create `tailwind.config.ts`:

```ts
import { tailwindVaria } from 'varia/tailwind'
import { components } from './recipes.js'

export default tailwindVaria({ components, manifest: false })
```

Create `styles.css`. Import order establishes component and utility precedence; source paths resolve relative to this stylesheet:

```css
@import "varia/tailwind.css";
@import "tailwindcss" source(none);
@source "./index.html";
@plugin "./tailwind.config.ts";
```

Create `vite.config.ts`. Importing the registration config lets native Vite reload recipes and their local imports; warmup compiles CSS at startup:

```ts
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import './tailwind.config.js'

export default defineConfig({
  plugins: [tailwindcss()],
  server: { warmup: { clientFiles: ['./styles.css'] } },
})
```

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Varia app</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <div class="row">
      <article class="col md:col-span-half card card-accent">
        <h1 class="card__title">First card</h1>
      </article>
      <article class="col md:col-span-half card">
        <h2 class="card__title text-red-600">Utility override</h2>
      </article>
    </div>
  </body>
</html>
```

Run `npm run dev`, edit a recipe, and confirm the page refreshes. Run `npm run build` to produce `dist/`. Keep component classes literal so Tailwind can discover them. Slot variants target matching descendants, including nested instances. The `md:` column variant uses Tailwind's default breakpoint. Native utilities override normal component declarations; class attribute order does not determine precedence.

See [API.md](API.md) for variants, compounds, prefixes, source scanning, optional types, monorepos, diagnostics, and compatibility. Native editor autocomplete needs no manifest or helper; follow [editor setup](API.md#editor-support) for automatic imported-recipe suggestion refresh.

## Work on this repository

Use Node.js 26 and pnpm 10.25.0. Typechecking uses TypeScript 7.

```sh
pnpm install
```

This checkout contains the Tailwind implementation, including the grid and strict class-type extensions. Use `pnpm build`, `pnpm test`, `pnpm example:dev`, and `pnpm example:build`. The [engine comparison](https://github.com/IHIutch/varia/blob/main/COMPARISON.md) records earlier branch experiments; [API.md](API.md) defines current behavior.

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm test:visual
pnpm test:reload
pnpm release:prepare
```

The library lives in `packages/varia`, example style definitions in `recipes`, and the demo in `examples/kitchen-sink`.

`pnpm release:prepare` runs unit tests, typecheck, lint, and the production example build, including a clean-install smoke test of the actual archive. It writes the verified archive to `.release/`. See [release preparation](API.md#release-preparation).

## Editor autocomplete

Use Tailwind CSS IntelliSense for Varia classes in ordinary markup and existing helpers such as `clsx`. The example's responsive grid uses plain class strings and disables manifest generation. See [editor support](API.md#editor-support) for settings, imported-recipe refresh, and troubleshooting. Unknown-class linting in markup is not a native extension rule.

The existing `varia/types` export is [optional TypeScript tooling](API.md#strict-class-types); it is not needed for autocomplete.

## Native Tailwind expansion

Recipes may use Tailwind's themes, custom utilities, arbitrary values, and individual modifiers. Tailwind's Vite integration processes authored CSS and native `@apply` directly. The downstream test verifies authored CSS and component application in a real consumer build. See [the contract](API.md#cascade-and-prefixes) for ordering and prefix behavior.

## Development reload

With `@tailwindcss/vite`, import your recipe registration config in `vite.config.ts` and set `server.warmup.clientFiles` to your CSS entry. Vite watches imported recipes and shared helpers, restarts after edits, and recovers when invalid edits in a running session are fixed. Warmup regenerates types before a browser opens.

See [Vite development reload](API.md#vite-development-reload) for the full configuration and supported paths.
