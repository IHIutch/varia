---
layout: home

hero:
  name: varia
  text: Component classes, generated on demand
  tagline: Tailwind CSS generation with the ergonomics of regular CSS. Define styles with Tailwind utilities, use readable component classes in any template, and generate CSS at build time without a styling runtime.
  actions:
    - theme: brand
      text: Build your first style
      link: /quickstart
    - theme: alt
      text: Browse the docs
      link: /documentation

features:
  - title: Regular CSS class ergonomics
    details: Define shared styles once, then write <code>btn btn-c-primary btn-s-lg</code> in your markup. Select variants without repeating utility lists or calling a styling function.
  - title: Slots and compound variants
    details: <code>slots</code> for multi-element widgets (Modal, Card, Dialog). <code>compoundVariants</code> for cross-axis CSS that applies when conditions combine.
  - title: Pure build-time
    details: Zero runtime. <code>tailwindVaria</code> registers component styles; Tailwind produces the actual CSS.
  - title: Framework-agnostic consumption
    details: Class strings work in HTML, ERB, Liquid, HEEx, JSX, or any other template language. No JS required at consumption sites.
  - title: Readable class names
    details: Generated names follow <code>btn-c-primary</code> / <code>btn-outline</code> / <code>modal__container</code> patterns the consumer can grep for and override.
  - title: Native Tailwind editor support
    details: Tailwind CSS IntelliSense suggests registered component classes and shows their CSS in ordinary markup and class helpers.
  - title: On-demand component CSS
    details: Tailwind generates styles when it finds component and variant classes in your source. Slot rules activate with their variant class; compounds activate with their first condition class.
---

## Define once, use ordinary classes

```ts
import { defineComponent } from 'variacss'

export default defineComponent('btn', {
  base: 'inline-flex items-center rounded font-medium',
  variants: {
    c: { primary: 'bg-blue-600 text-white hover:bg-blue-700' },
    s: { lg: 'px-4 py-2 text-lg' },
  },
})
```

```html
<button class="btn btn-c-primary btn-s-lg">Save</button>
```

Register this definition with `tailwindVaria` in a plugin module. Tailwind scans your templates and generates the component CSS they use. The same markup works in HTML, JSX, ERB, HEEx, and Liquid.

Varia handles component styling. The recipes show styles you can adapt; your application or component framework supplies markup, interaction behavior, and accessibility.

[Build your first component style](/quickstart), [integrate into an existing project](/tailwind), or [browse the documentation](/documentation).
