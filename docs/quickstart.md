# Quickstart

From `npm install` to a working button in five minutes.

## 1. Install

```bash
pnpm add -D varia unocss
# or: npm install --save-dev varia unocss
```

`varia` declares `unocss` as a peer dependency. You bring your own UnoCSS version (latest recommended).

## 2. Define a component

Variants are just utility class strings. You embed `hover:`, `focus-visible:`, `disabled:`, `md:` prefixes inline; they pass straight through to UnoCSS.

```ts
// styles/button.config.ts
import { defineComponent } from 'varia'

// Each color sets per-button CSS variables driven by the UnoCSS palette.
// The style variants below consume those variables to produce the shape.
export default defineComponent('btn', {
  base: 'inline-flex items-center justify-center rounded-md font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    c: {
      primary: '[--btn-bg:theme(colors.blue.600)] [--btn-bg-hover:theme(colors.blue.700)] [--btn-text:theme(colors.blue.700)] [--btn-border:theme(colors.blue.300)] [--btn-bg-subtle:theme(colors.blue.50)]',
      danger:  '[--btn-bg:theme(colors.red.600)] [--btn-bg-hover:theme(colors.red.700)] [--btn-text:theme(colors.red.700)] [--btn-border:theme(colors.red.300)] [--btn-bg-subtle:theme(colors.red.50)]',
      success: '[--btn-bg:theme(colors.emerald.600)] [--btn-bg-hover:theme(colors.emerald.700)] [--btn-text:theme(colors.emerald.700)] [--btn-border:theme(colors.emerald.300)] [--btn-bg-subtle:theme(colors.emerald.50)]',
    },
    style: {
      solid:   'bg-[var(--btn-bg)] text-white border-[var(--btn-bg)] hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-bg-hover)]',
      outline: 'bg-transparent text-[var(--btn-text)] border-[var(--btn-border)] hover:bg-[var(--btn-bg-subtle)]',
      ghost:   'bg-transparent text-[var(--btn-text)] border-transparent hover:bg-[var(--btn-bg-subtle)]',
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
})
```

The repetition across colors is real but explicit. The full Button recipe in this project uses a small helper to DRY it up; see [the recipe page](/recipes/button) for the factored form.

This shape decouples three orthogonal concerns: **color** sets per-component vars from the palette, **style** chooses which roles those vars fill in (solid/outline/ghost), and **size** is independent of both.

## 3. Wire `presetVaria` into your UnoCSS config

```ts
// unocss.config.ts
import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import { presetVaria } from 'varia/preset'

import button from './styles/button.config'

export default defineConfig({
  presets: [
    presetWind4(),
    presetVaria({ components: [button] }),
  ],
})
```

## 4. Use the classes

```html
<button class="btn btn-c-primary btn-style-solid btn-s-lg">
  Save
</button>

<button class="btn btn-c-danger btn-style-outline btn-s-sm">
  Delete
</button>

<button class="btn btn-c-success btn-style-ghost btn-s-md">
  Cancel
</button>
```

That's it. UnoCSS expands the shortcuts into atomic CSS at build time. Only the classes you actually reference end up in the output.

## 5. Editor autocomplete (recommended)

Install the UnoCSS VS Code extension ([antfu.unocss](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)). It reads shortcuts from `unocss.config.ts` and offers completion in HTML, JSX, ERB, Liquid, HEEx, and any glob you configure.

For TypeScript codebases that want to validate class strings against the known set, `varia` also generates a `node_modules/.varia/manifest.d.ts` with a union of every valid class name. Import it via:

```ts
import type { VariaClasses } from 'varia/types'

function cn(c: VariaClasses) { /* ... */ }

cn('btn-c-primary')        // ok
cn('btn-style-solid')      // ok
cn('not-a-real-class')     // type error
```

::: tip pnpm users
Under pnpm's default symlinked layout, the `varia/types` subpath may not resolve unless you set `compilerOptions.preserveSymlinks: true` in your `tsconfig.json`, or use `node-linker=hoisted` in `.npmrc`. The UnoCSS VS Code extension works without any tsconfig changes.
:::

## Next

- [API reference](/api): every option for `defineComponent`, `defineSlotComponent`, `compoundVariants`, and `presetVaria`.
- [Naming convention](/naming): formal rules for variant classes (`btn-c-primary`) and slot classes (`modal__container`).
- [Recipes](/recipes/button): worked examples covering state handling, theming, multi-element components, and slot-keyed variants (the [Modal recipe](/recipes/modal) is the canonical slot example).
- [Comparison](/comparison): when would you pick `varia` over CVA, tailwind-variants, vanilla-extract, or Panda CSS?
