# Slots

Use slots when a component style covers several elements. Start with [a working Tailwind integration](/tailwind). The example below styles a panel and changes its title color through an ancestor class.

## Define the slots

Create `panel.config.ts` beside your Varia plugin configuration:

```ts
import { defineComponent } from 'variacss'

export default defineComponent('panel', {
  slots: {
    root: 'rounded border border-gray-200 p-4',
    title: 'text-lg font-semibold',
    body: 'mt-2 text-gray-700',
  },
  variants: {
    accent: { title: 'text-blue-600' },
  },
})
```

Import the definition in your plugin configuration and add it to `components`:

```ts
import { tailwindVaria } from 'variacss/tailwind'
import panel from './panel.config.js'

export default tailwindVaria({ components: [panel] })
```

Retain any other definitions already in that array. Use `slots.root` for the component's own styles; `base` and `slots` cannot appear together in a definition.

## Apply classes to the elements

Put this markup in a scanned template:

```html
<article class="panel panel-accent">
  <h2 class="panel__title">Account</h2>
  <p class="panel__body">Manage your preferences.</p>
</article>
```

With the registration module imported in your Vite configuration, Vite restarts after changing registration or definitions. The panel should have a border and padding, and its title should be blue. Remove `panel-accent` to remove the title color override.

Place `panel__title` on a descendant of the element with `panel-accent`. Putting both classes on the same element does not match the descendant rule. Include the base slot class even if you also use a responsive form such as `md:panel__title`.

## Target several slots with one value

Replace the variants block with:

```ts
variants: {
  tone: {
    info: {
      root: 'border-blue-300',
      title: 'text-blue-600',
    },
  },
},
```

Use `panel panel-tone-info` on the article and keep the descendant slot classes. The article gets the border color, and the title gets its text color. Slot variants emit their targeted rules when the activation class is discovered; they do not include the slot base expansions automatically.

## Keep nested instances independent

An outer `panel-accent` or `panel-tone-info` also matches `panel__title` elements inside nested panels. Nesting a `panel` root does not stop that matching. If nested components need independent styling, use distinct component names for them or author explicit application CSS with selectors suited to your markup.

For exact matching and state behavior, see [activation and slots](/reference/definitions#slot-activation). For the rationale, read [the styling model](/concepts#classes-describe-css-rules).
