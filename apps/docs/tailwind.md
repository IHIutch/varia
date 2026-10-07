# Tailwind CSS

The `tailwindVaria` plugin registers Varia definitions with Tailwind CSS v4.3.3 or newer. It uses Tailwind's public JavaScript plugin interface and `@apply`; no separate Varia scanner or styling runtime is required.

`defineComponent` uses Tailwind utility strings for base styles, variants, slots, and compounds.

## Install

```bash
pnpm add -D variacss tailwindcss
```

First configure Tailwind for your build using its [installation guide](https://tailwindcss.com/docs/installation). For Vite, install `@tailwindcss/vite` and add its plugin to your Vite config.

## Register components

Export a plugin module that calls `tailwindVaria`:

```ts
// styles/varia.config.ts
import { defineComponent } from 'variacss'
import { tailwindVaria } from 'variacss/tailwind'

const button = defineComponent('btn', {
  base: 'inline-flex items-center rounded-md font-medium',
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

export default tailwindVaria({ components: [button] })
```

Load it from your stylesheet. The plugin path is relative to this stylesheet:

```css
/* styles/app.css */
@import "variacss/tailwind.css";
@import "tailwindcss";
@source not "./**/*.config.ts";
@plugin "./varia.config.ts";
```

Exclude your component definition files from source detection. Otherwise Tailwind scans their literal utility strings and emits those atomic utilities and their dependencies, even when the corresponding Varia classes are unused. This example excludes `.config.ts` files in the stylesheet's directory and subdirectories. Add exclusions for definitions stored elsewhere, or use `source(none)` with explicit `@source` entries for your templates.

```html
<button class="btn btn-c-primary btn-s-lg">Save</button>
```

Tailwind generates component rules for scanned classes. Applied utility strings resolve against the current theme, including `@theme` tokens, custom utilities, arbitrary values, and state or responsive variants. `md:btn-s-lg` works as a responsive component class.

## Slots and compounds

Slot base classes use the existing `card__title` naming convention. A slot-keyed variant emits all its descendant rules when its variant class is found, even if the descendant classes are not scanned separately.

A compound emits through the class for its first `when` condition. Its selector requires the remaining conditions on the same element. Unused activation classes emit no component rules or animation dependencies.

The `variacss/tailwind.css` import defines Tailwind's standard layer order and three sublayers inside its utilities layer: base, variants, and compounds, in that order. Keep this import before Tailwind's import so the order is established before any generated rule. Variants override base styles, and compounds override variants, regardless of Tailwind's utility sorting. The adapter adds no specificity to enforce this order.

Ordinary Tailwind utilities outrank all three sublayers, including descendant slot rules. For example, `btn btn-c-primary bg-red-600` uses the red background without an important modifier. An `opacity-100` class on `card__title` overrides a slot variant's opacity. Tailwind's state and responsive conditions still determine when a rule matches. Explicit important declarations follow CSS's important cascade, which reverses layer precedence.

Utility string order follows Tailwind's native ordering. Varia does not choose a winner for competing values within one layer. Native CSS can `@apply` registered component classes, including through reference stylesheets.

## Options

```ts
interface TailwindVariaOptions {
  components: DefinedComponent[]
  prefix?: string
}
```


Prefixes must contain lowercase ASCII letters only. To use prefixed classes, set `prefix: 'tw'` in `tailwindVaria`. This configures Tailwind's prefix and prefixes Varia's applied utilities, descendant selectors, and compounds. Write `tw:btn tw:btn-c-primary` in markup. Responsive classes use `tw:md:btn-s-lg`.

If your stylesheet already imports Tailwind with `prefix(tw)`, also pass the matching `prefix: 'tw'` to `tailwindVaria`. Tailwind's plugin interface does not expose that CSS prefix. Prefixes supplied through a JavaScript config are detected automatically.

## Try the existing recipes

From this repository:

```bash
pnpm build
pnpm example:dev
```

This runs the kitchen-sink demo with Tailwind. Run `pnpm example:build` for a production build.

Write each Tailwind variant explicitly, such as `hover:bg-blue-600 hover:text-white`. Component identifiers that overlap Tailwind's built-in utilities can also contribute built-in CSS, so choose distinct names.

## Development reload

Use `@tailwindcss/vite` and import the same recipe registration configuration used by CSS in `vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import './tailwind.config.js'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    warmup: { clientFiles: ['./src/styles.css'] },
  },
})
```

Keep the stylesheet's `@plugin` directive. The additional config import makes recipes and their transitive local imports dependencies of Vite's configuration. In a running development session, Vite restarts when those dependencies change and recovers after invalid edits are fixed. This avoids a Tailwind 4.3.3 recovery failure observed with CSS HMR alone. No Varia watcher or Vite plugin is required.

[Vite's CSS warmup](https://vite.dev/config/server-options#server-warmup) compiles the stylesheet on startup and after a configuration restart, before a browser requests CSS. Warmup paths resolve from Vite's root. Invalid recipes report the original error. An invalid recipe at initial startup prevents Vite from starting; fix it and run Vite again.

The supported boundary is static local imports reachable from the configuration, including shared monorepo sources outside the app root. Add/remove definitions in `tailwindVaria({ components })` as well as on disk. Directory discovery, runtime-computed imports, and editing installed packages under `node_modules` are outside this guarantee. Use Vite's default bundled configuration loader and keep file watching enabled.

`pnpm test:reload` remains an optional integration check for imported helper edits, added/removed classes, invalid-definition recovery, and computed CSS. It uses a packed Varia archive and installed development dependencies. It is separate from the minimal release gate.

## Monorepos

Install Varia, Tailwind, and the Vite plugin in the consuming app. Import shared recipe sources from the app's registration configuration, and import that configuration in the app's `vite.config.ts`. Vite's bundled config loader tracks static local imports outside the app root as well. The shared module must resolve its `variacss` import through an explicit workspace dependency.

With `source(none)`, add `@source` paths for every app/shared directory containing markup or class strings. Paths are relative to the stylesheet, for example `@source "../../../packages/ui/src";` from `apps/web/src/styles.css`. Registering recipe definitions does not tell Tailwind where their consumers live. Keep source scanning and recipe imports configured separately.

See [editor support](/recipes/type-safety) for explicit stylesheet-to-app mappings.
