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

export default defineComponent('btn', {
  base: 'inline-block font-medium rounded',
  variants: {
    c: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
      danger:  'bg-red-600 text-white hover:bg-red-700',
    },
    s: {
      sm: 'px-2 py-1 text-sm',
      lg: 'px-6 py-3 text-lg',
    },
    outline: 'bg-transparent border-2',
  },
})
```

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
<button class="btn btn-c-primary btn-s-lg">
  Save
</button>

<button class="btn btn-c-danger btn-s-sm btn-outline">
  Delete
</button>
```

That's it. UnoCSS expands the shortcuts into atomic CSS at build time. Only the classes you actually reference end up in the output.

## 5. Editor autocomplete (recommended)

Install the UnoCSS VS Code extension ([antfu.unocss](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)). It reads shortcuts from `unocss.config.ts` and offers completion in HTML, JSX, ERB, Liquid, HEEx, and any glob you configure.

For TypeScript codebases that want to validate class strings against the known set, `varia` also generates a `node_modules/.varia/manifest.d.ts` with a union of every valid class name. Import it via:

```ts
import type { VariaClasses } from 'varia/types'

function cn(c: VariaClasses) { /* ... */ }

cn('btn-c-primary')   // ok
cn('not-a-real-class') // type error
```

::: tip pnpm users
Under pnpm's default symlinked layout, the `varia/types` subpath may not resolve unless you set `compilerOptions.preserveSymlinks: true` in your `tsconfig.json`, or use `node-linker=hoisted` in `.npmrc`. The UnoCSS VS Code extension works without any tsconfig changes.
:::

## Next

- [API reference](/api): every option for `defineComponent` and `presetVaria`.
- [Naming convention](/naming): formal rules for the class-name format.
- [Recipes](/recipes/button): six worked examples with state handling, theming, and multi-element components.
- [Comparison](/comparison): when would you pick `varia` over CVA, tailwind-variants, vanilla-extract, or Panda CSS?
