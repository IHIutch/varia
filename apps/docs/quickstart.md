# Quickstart

Define a button once, use regular component classes in markup, and let Tailwind generate its CSS on demand.

## 1. Install

```bash
pnpm add -D variacss tailwindcss @tailwindcss/vite
```

For Vite, add `tailwindcss()` from `@tailwindcss/vite` to your Vite plugins. Other build tools can use their [Tailwind integration](https://tailwindcss.com/docs/installation). The adapter requires Tailwind v4.3.3 or newer.

Version 1.0.0 is prepared but has not been published. Until publication, replace `variacss` in the install command with the absolute path to `.release/variacss-1.0.0.tgz`, produced by `pnpm release:prepare` in this repository. Use Node.js 26 or newer.

## 2. Define and register a component

```ts
// styles/varia.config.ts
import { defineComponent } from 'variacss'
import { tailwindVaria } from 'variacss/tailwind'

const button = defineComponent('btn', {
  base: 'inline-flex items-center rounded-md font-medium transition-colors disabled:opacity-50',
  variants: {
    c: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
})

export default tailwindVaria({ components: [button] })
```

Import the same registration module in `vite.config.ts` so Vite tracks recipe edits and their local imports:

```ts
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import './styles/varia.config.js'

export default defineConfig({
  plugins: [tailwindcss()],
  server: { warmup: { clientFiles: ['./styles/app.css'] } },
})
```

`base` defines shared styles. The color and size axes define independent variants. State and responsive utility prefixes resolve through Tailwind.

## 3. Load the stylesheet

```css
/* styles/app.css */
@import "variacss/tailwind.css";
@import "tailwindcss";
@source not "./**/*.config.ts";
@plugin "./varia.config.ts";
```

Import `styles/app.css` through your build. Keep the Varia import first to establish layer order before generated rules. Exclude component definition files from scanning so their literal utility strings do not generate unused atomic CSS. Add exclusions for definitions stored elsewhere, or use explicit sources as described in the [Tailwind guide](/tailwind).

## 4. Use the classes

```html
<button class="btn btn-c-primary btn-s-lg">Save</button>
<button class="btn btn-c-danger btn-s-sm">Delete</button>
```

Tailwind generates the component classes found in your templates. You can write responsive component classes, such as `md:btn-s-lg`.

Ordinary utilities override Varia styles without important modifiers:

```html
<button class="btn btn-c-primary btn-s-lg rounded-none">Save</button>
```

Layers enforce base, variant, and compound precedence. Ordinary utilities outrank all three, including descendant slot rules.

## Next

- [Recipes](/recipes/button) covers state styles, slots, and compound variants.
- [Tailwind options](/tailwind) covers prefixes, source detection, and the demo.
- [Editor support](/recipes/type-safety) covers native Tailwind suggestions.
