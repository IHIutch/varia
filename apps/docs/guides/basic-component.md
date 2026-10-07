# Basic component

Define a button and use its class in a template.

## Define the base styles

Create `button.config.ts` beside your `varia.config.ts`:

```ts [button.config.ts]
import { defineComponent } from 'variacss'

export default defineComponent('btn', {
  base: [
    'inline-flex items-center justify-center rounded px-4 py-2 font-medium',
    'bg-blue-600 text-white hover:bg-blue-700',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
  ],
})
```

The name `btn` becomes the base class. Utility values are nonempty strings or arrays of strings. A definition needs at least one base style, slot, or variant.

## Register and use it

Import the definition into `varia.config.ts` and add it to `components`:

```ts [varia.config.ts]
import { tailwindVaria } from 'variacss/tailwind'
import button from './button.config.js'

export default tailwindVaria({ components: [button] })
```

Keep any other definitions you already register. Add the button to a scanned template:

```html
<button type="button" class="btn">Save</button>
```

Run your development command. You should see a blue button with white text and padding.
