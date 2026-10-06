# Quickstart

Define a button once, use regular component classes in your markup, and let UnoCSS generate its CSS on demand.

This guide assumes UnoCSS is already integrated with your build so it scans your templates and loads the generated stylesheet. If you haven't set that up, follow the [UnoCSS integration guide](https://unocss.dev/integrations/) first.

## 1. Install

```bash
pnpm add -D varia unocss @unocss/preset-wind4
# or: npm install --save-dev varia unocss @unocss/preset-wind4
```

`varia` declares `unocss` as a peer dependency. The utility strings in this example use the Wind4 preset.

## 2. Define a component

Pass your component config to `defineComponent`. Variant values are utility class strings; prefixes like `hover:` and `md:` pass through to UnoCSS.

```ts
// styles/button.config.ts
import { defineComponent } from 'varia'

export default defineComponent('btn', {
  base: 'inline-flex items-center justify-center rounded-md font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    c: {
      primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
      danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
      neutral: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
})
```

The color and size axes each define three values. `base` defines shared styles. The [Button recipe](/recipes/button) adds solid, outline, subtle, and ghost styles with compound rules for color and style combinations.

## 3. Wire `presetVaria` into your UnoCSS config

```ts
// unocss.config.ts
import presetWind4 from '@unocss/preset-wind4'
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
<button class="btn btn-c-primary btn-s-lg">
  Save
</button>

<button class="btn btn-c-danger btn-s-sm">
  Delete
</button>

<button class="btn btn-c-neutral btn-s-md">
  Cancel
</button>
```

UnoCSS generates CSS for the shortcuts it finds in your configured source files. For this button, an unused color or size shortcut produces no CSS. The class names remain ordinary CSS selectors, so you can also target them in your own styles.

Compound variants and slot-keyed variants, covered in the recipes, currently emit all their registered rules. See [How emission works](/api#how-emission-works).

## 5. Editor autocomplete (recommended)

Install the UnoCSS VS Code extension ([antfu.unocss](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)). It reads shortcuts from `unocss.config.ts` and offers completion in HTML, JSX, ERB, Liquid, HEEx, and any glob you configure.

For TypeScript projects that also want to type-check class strings against the manifest, see the [Type safety recipe](/recipes/type-safety).

## Next

- [Concepts](/concepts) explains shortcuts, generated CSS, and the class manifest.
- [Recipes](/recipes/button) shows state styles, slots, and compound variants.
