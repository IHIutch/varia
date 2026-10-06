---
layout: home

hero:
  name: varia
  text: Component classes, generated on demand
  tagline: Tailwind-style CSS generation with the ergonomics of regular CSS. Define styles with UnoCSS utilities, use readable component classes in any template, and generate CSS at build time without a styling runtime.
  actions:
    - theme: brand
      text: Quickstart
      link: /quickstart
    - theme: alt
      text: API reference
      link: /api

features:
  - title: Regular CSS class ergonomics
    details: Define shared styles once, then write <code>btn btn-c-primary btn-s-lg</code> in your markup. Select variants without repeating utility lists or calling a styling function.
  - title: Slots and compound variants
    details: <code>slots</code> for multi-element widgets (Modal, Card, Dialog). <code>compoundVariants</code> for cross-axis CSS that applies when conditions combine.
  - title: Pure build-time
    details: Zero runtime. <code>presetVaria</code> emits UnoCSS shortcuts; UnoCSS produces the actual CSS.
  - title: Framework-agnostic consumption
    details: Class strings work in HTML, ERB, Liquid, HEEx, JSX, or any other template language. No JS required at consumption sites.
  - title: Readable class names
    details: Generated names follow <code>btn-c-primary</code> / <code>btn-outline</code> / <code>modal__container</code> patterns the consumer can grep for and override.
  - title: Editor autocomplete out of the box
    details: The UnoCSS VS Code extension reads your config and offers completion in HTML, JSX, ERB, Liquid, HEEx, and anywhere else classes live.
  - title: Optional TypeScript checking
    details: A generated <code>VariaClasses</code> union lets you type-check class strings in TS projects, or build custom lint rules.
  - title: On-demand shortcut CSS
    details: UnoCSS generates component and variant shortcut CSS when it finds their classes in your source. Compound and slot-keyed rules currently ship for every registered definition.
---

## Define once, use ordinary classes

```ts
import { defineComponent } from 'varia'

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

Register this definition with `presetVaria` in your UnoCSS config. UnoCSS scans your templates and generates the shortcut CSS they use. The same markup works in HTML, JSX, ERB, HEEx, and Liquid.

Varia handles component styling. The recipes show styles you can adapt; your application or component framework supplies markup, interaction behavior, and accessibility.

[Get started with a working button](/quickstart) or [learn how CSS generation works](/concepts).
