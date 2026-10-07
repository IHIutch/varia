# Compound variants

Use a compound when styles depend on several variants together. An icon-only button needs equal padding, with a different amount at each size.

## Combine size and square

Extend the button's variants with a boolean `square` variant and compound rules:

```ts{17,19-22} [button.config.ts]
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
    square: 'aspect-square',
  },
  compoundVariants: [
    { when: { size: 'sm', square: true }, class: 'p-1' },
    { when: { size: 'lg', square: true }, class: 'p-3' },
  ],
})
```

`size` controls normal button padding and text size. `square` sets the aspect ratio. The compounds replace the padding when both conditions match. In `when`, use declared variant values or `true` for a boolean variant; `class` accepts a utility string or string array.

## Use the existing variant classes

```html
<button type="button" class="btn btn-tone-primary btn-size-lg">Add</button>
<button type="button" class="btn btn-tone-primary btn-size-lg btn-square"
        aria-label="Add">
  <span aria-hidden="true">+</span>
</button>
```

The labeled button keeps `px-6 py-3`. The icon-only button gets `p-3`. The compound matches `.btn-size-lg.btn-square`; it adds no class of its own. Both condition classes belong on the same element.

The first `when` entry, in JavaScript property order, activates generation. Scanning `btn-size-lg` emits the combined rule even if `btn-square` was not scanned. Scanning only `btn-square` does not.

Modifiers apply to that first class. Remaining conditions require bare classes on the same element, including any configured prefix.
