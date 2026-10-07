# Variants

Variants give a component named style choices. Extend the basic button with tone and size variants.

## Define the choices

Replace `button.config.ts` with:

```ts{8-17} [button.config.ts]
import { defineComponent } from 'variacss'

export default defineComponent('btn', {
  base: [
    'inline-flex items-center justify-center rounded px-4 py-2 font-medium',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
  ],
  variants: {
    tone: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    },
    size: {
      sm: 'px-2 py-1 text-sm',
      lg: 'px-6 py-3 text-lg',
    },
  },
})
```

Color has moved from the base into `tone`. The base keeps shared layout and focus styles.

## Select variants in markup

```html
<button type="button" class="btn btn-tone-primary btn-size-lg">Save</button>
<button type="button" class="btn btn-tone-secondary btn-size-sm">Cancel</button>
```

Names follow `component-axis-value`. The first button is blue and large; the second is gray and small. Change a tone class to switch colors. Omit the size class to use the base padding.

Varia applies no default variants. Choose one value for each variant, such as `tone` or `size`, and keep complete class names in scanned templates.

## Boolean variants

For an on/off style, add a utility string directly to `variants`:

```ts
muted: 'opacity-50'
```

```html
<button type="button" class="btn btn-tone-primary btn-muted">Save</button>
```

The class is `btn-muted`. Remove it to turn the style off; there is no `-true` or `-false` suffix.
