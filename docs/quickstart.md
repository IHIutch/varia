# Quickstart

## Install

::: code-group

```sh [npm]
npm install variacss tailwindcss
```

```sh [pnpm]
pnpm add variacss tailwindcss
```

```sh [Yarn]
yarn add variacss tailwindcss
```

```sh [Bun]
bun add variacss tailwindcss
```

:::

## Define and register a component

Create `varia.config.ts` beside your CSS entrypoint:

```ts [varia.config.ts]
import { defineComponent } from 'variacss'
import { tailwindVaria } from 'variacss/tailwind'

const button = defineComponent('demo-btn', {
  base: 'inline-flex rounded bg-blue-600 px-4 py-2 font-medium text-white',
  variants: {
    size: {
      lg: 'px-6 py-3 text-lg',
    },
  },
})

export default tailwindVaria({ components: [button] })
```

## Load the plugin

Update your CSS entrypoint, keeping the imports in this order:

```css{1-2} [styles.css]
@import "variacss/tailwind.css";
@import "tailwindcss";
@source not "./**/*.config.ts";
@plugin "./varia.config.ts";
```

The first import sets component layer order. `@source not` requires Tailwind 4.1+ and prevents definition files from generating standalone utilities. Paths are relative to this stylesheet; adjust the exclusion if you store definitions elsewhere.

## Use the classes

```html
<button type="button" class="demo-btn demo-btn-size-lg">Save</button>
```

Run your existing development command. The button should be blue with larger padding and text. Remove `demo-btn-size-lg` to return to the base size.

See [troubleshooting](/troubleshooting) if styles are missing.

## Editor support

Install [Tailwind CSS IntelliSense](https://github.com/tailwindlabs/tailwindcss-intellisense#installation) for VS Code. It loads the plugin from your CSS entrypoint to suggest Varia classes and show their CSS on hover.

## Development reload

With `@tailwindcss/vite` and Vite's default bundled config loader, import your registration module in `vite.config.ts`. Vite will restart when that module or its imported definitions change:

```ts{3} [vite.config.ts]
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import './src/varia.config.js'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

Adjust the import path to your project and keep the stylesheet's `@plugin` directive.

## Source detection

Tailwind detects Varia classes just like utilities. Use complete class names when choosing variants dynamically:

```ts
const sizes = { base: 'demo-btn', lg: 'demo-btn demo-btn-size-lg' }
```

For custom scan paths and safelisting, see Tailwind's [source detection documentation](https://tailwindcss.com/docs/detecting-classes-in-source-files).

## Options

`tailwindVaria` accepts a `components` array of unchanged `defineComponent` outputs and an optional `prefix`:

```ts
export default tailwindVaria({ components: [button], prefix: 'tw' })
```

```html
<button class="tw:demo-btn tw:md:demo-btn-size-lg">Save</button>
```

Keep definition utilities unprefixed. Prefixes contain lowercase ASCII letters only. If your stylesheet uses `@import "tailwindcss" prefix(tw)`, also pass the matching `prefix: 'tw'`; the plugin cannot read CSS-declared prefixes. JavaScript-configured prefixes are detected automatically.
