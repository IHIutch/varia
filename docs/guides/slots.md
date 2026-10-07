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

Add this definition to your plugin's `components` array. The `root` slot uses the component name and is equivalent to `base`; other slots use `component__slot`. `base` and `slots` cannot appear together.

```html
<article class="panel panel-accent">
  <h2 class="panel__title">Account</h2>
  <p class="panel__body">Manage your preferences.</p>
</article>
```

`panel-accent` turns the title blue through `.panel-accent .panel__title`. Replace it with `panel-tone-info` to change both the root border and title color.

At the top level of a variant definition, declared slot names identify a boolean slot variant. Do not mix those keys with value names.

## Matching slots

A slot variant emits its targeted rules when its activation class is scanned. It does not include slot bases automatically. Root overrides match the activation element without requiring the base class.

Other slots must be descendants with their bare slot class. A title on the activation element itself, or with only `md:panel__title`, does not match `.panel-accent .panel__title`.

Outer variants also reach titles inside nested panels. Use distinct component names or explicit CSS when nested instances need independent styling.

States inside an expansion act on the slot; modifiers on the variant class act on its ancestor. For example, `hover:panel-accent` with a title expansion of `focus:opacity-75` requires hover on the ancestor and focus on the title.
