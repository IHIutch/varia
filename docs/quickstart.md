# Quickstart

From `npm install` to a working button in five minutes.

## 1. Install

```bash
pnpm add -D varia unocss
# or: npm install --save-dev varia unocss
```

`varia` declares `unocss` as a peer dependency. You bring your own UnoCSS version (latest recommended).

## 2. Define a component

Pass your component config to `defineComponent`. Variant values are utility class strings; prefixes like `hover:` and `md:` pass through to UnoCSS.

```ts
// styles/button.config.ts
import { defineComponent } from 'varia'

// Build the per-button CSS vars for one palette tone. The `style` variants
// below consume these vars.
//   colorVars('blue') → ['[--btn-bg:theme(colors.blue.600)]', '[--btn-bg-hover:theme(colors.blue.700)]', …]
function colorVars(tone: string): string[] {
  return [
    '[--btn-bg:theme(colors.' + tone + '.600)]',
    '[--btn-bg-hover:theme(colors.' + tone + '.700)]',
    '[--btn-text:theme(colors.' + tone + '.700)]',
    '[--btn-border:theme(colors.' + tone + '.300)]',
    '[--btn-bg-subtle:theme(colors.' + tone + '.50)]',
  ]
}

export default defineComponent('btn', {
  base: 'inline-flex items-center justify-center rounded-md font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    // color: sets per-button CSS vars from the palette
    c: {
      primary: colorVars('blue'),
      danger: colorVars('red'),
      success: colorVars('emerald'),
    },
    // style: consumes those vars to produce the shape
    style: {
      solid: 'bg-[var(--btn-bg)] text-white border-[var(--btn-bg)] hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-bg-hover)]',
      outline: 'bg-transparent text-[var(--btn-text)] border-[var(--btn-border)] hover:bg-[var(--btn-bg-subtle)]',
      ghost: 'bg-transparent text-[var(--btn-text)] border-transparent hover:bg-[var(--btn-bg-subtle)]',
    },
    // size: independent of both
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
})
```

## 3. Wire `presetVaria` into your UnoCSS config

```ts
import presetWind4 from '@unocss/preset-wind4'
// unocss.config.ts
import { defineConfig } from 'unocss'
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

cn('btn-c-primary') // ok
cn('btn-style-solid') // ok
cn('not-a-real-class') // type error
```

::: tip pnpm users
The `varia/types` subpath may not resolve under pnpm's default layout. See [Troubleshooting → pnpm: `varia/types` subpath](/troubleshooting#pnpm-types-subpath). The UnoCSS VS Code extension works without any tsconfig changes.
:::

## Next

- [Concepts](/concepts): 5-minute orientation if any of "build-time variants", "shortcuts", "JIT", or "manifest" felt unfamiliar.
- [API reference](/api): every option for `defineComponent`, `defineSlotComponent`, `compoundVariants`, and `presetVaria`.
- [Naming convention](/naming): formal rules for variant classes (`btn-c-primary`) and slot classes (`modal__container`).
- [Recipes](/recipes/button): worked examples covering state handling, theming, multi-element components, and slot-keyed variants (the [Modal recipe](/recipes/modal) is the slot-keyed example).
- [Comparison](/comparison): when would you pick `varia` over CVA, tailwind-variants, vanilla-extract, or Panda CSS?
- [Troubleshooting](/troubleshooting): known gotchas (pnpm layout, identifier conflicts).
