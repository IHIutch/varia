# Slots

Use slots to style several elements through one definition:

```ts{4-8}
import { defineComponent } from 'variacss'

export default defineComponent('panel', {
  slots: {
    root: 'rounded border border-gray-200 p-4',
    title: 'text-lg font-semibold',
    body: 'mt-2 text-gray-700',
  },
  variants: {
    accent: { title: 'text-blue-600' },
    tone: {
      info: { root: 'border-blue-300', title: 'text-blue-600' },
    },
  },
})
```

Add this definition to your plugin's `components` array. The `root` slot uses the component name as its class. Other slots use `component__slot`.

`base` is shorthand for `slots: { root: ... }`. Use either `base` or `slots` in a definition.

```html
<article class="panel panel-accent">
  <h2 class="panel__title">Account</h2>
  <p class="panel__body">Manage your preferences.</p>
</article>
```

`panel-accent` turns the title blue through `.panel-accent .panel__title`. Replace it with `panel-tone-info` to change both the root border and title color.

A variant object whose keys are all declared slot names defines a boolean variant, as `accent` does here. An object whose keys are all variant values defines a choice, as `tone` does. Do not mix slot names and value names at that level.

## Matching slots

When Tailwind detects `panel-accent`, it emits the rule for the title override. It emits the base title styles separately when it detects `panel__title`.

A variant targeting `root` styles the element carrying the variant class. It does not require the base `panel` class to match.

Other slots must be descendants of the element carrying the variant class. Use their slot classes without modifiers. Putting `panel__title` on the same element as `panel-accent`, or using only `md:panel__title` on a child, does not match `.panel-accent .panel__title`.

Outer variants also reach titles inside nested panels. Use distinct component names or explicit CSS when nested instances need independent styling.

A modifier inside a slot's utilities applies to that slot. A modifier on the variant class applies to the ancestor carrying it. For example, `hover:panel-accent` with title utilities of `focus:opacity-75` requires hover on the ancestor and focus on the title.
