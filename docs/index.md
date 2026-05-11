---
layout: home

hero:
  name: varia
  text: Build-time variants for UnoCSS
  tagline: A CVA-shaped config for authoring component vocabularies. JIT for design systems, no runtime, framework-agnostic at consumption.
  actions:
    - theme: brand
      text: Quickstart
      link: /quickstart
    - theme: alt
      text: API reference
      link: /api

features:
  - title: Familiar config shape
    details: A CVA-shaped <code>defineComponent</code> for authoring variants. If you've used class-variance-authority, you'll feel at home.
  - title: Slots and compound variants
    details: <code>defineSlotComponent</code> for multi-element widgets (Modal, Card, Dialog). <code>compoundVariants</code> for cross-axis CSS that applies when conditions combine.
  - title: Pure build-time
    details: Zero runtime. <code>presetVaria</code> emits UnoCSS shortcuts; UnoCSS produces the actual CSS.
  - title: Framework-agnostic consumption
    details: Class strings work in HTML, ERB, Liquid, HEEx, JSX, or any other template language. No JS required at consumption sites.
  - title: Readable class names
    details: Generated names follow <code>btn-c-primary</code> / <code>btn-outline</code> / <code>modal__container</code> patterns the consumer can grep for and override.
  - title: Editor-friendly
    details: The UnoCSS VS Code extension gives autocomplete out of the box. A generated <code>VariaClasses</code> union enables linting in TS projects.
  - title: JIT for design systems
    details: Consumers compile only the components they actually use. The same JIT story Tailwind brought to utilities, applied to design-system components.
---
