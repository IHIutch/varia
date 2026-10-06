# Quickstart

Define a button once, use regular component classes in markup, and let Tailwind generate its CSS on demand.

## 1. Install

```bash
pnpm add -D varia tailwindcss @tailwindcss/vite
```

For Vite, add `tailwindcss()` from `@tailwindcss/vite` to your Vite plugins. Other build tools can use their [Tailwind integration](https://tailwindcss.com/docs/installation). The adapter requires Tailwind v4.3.3 or newer.

## 2. Define and register a component

```ts
// styles/varia.config.ts
import { defineComponent } from 'varia'
import { tailwindVaria } from 'varia/tailwind'

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

`base` defines shared styles. The color and size axes define independent variants. State and responsive utility prefixes resolve through Tailwind.

## 3. Load the stylesheet

```css
/* styles/app.css */
@import "varia/tailwind.css";
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
- [Type safety](/recipes/type-safety) covers the generated class-name union.
