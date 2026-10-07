# Comparison

Varia combines on-demand CSS generation with regular component classes. You author styles with Tailwind CSS utilities, then use names such as `btn btn-c-primary` in markup.

## Compared with utility classes

Utility classes let you style an element directly in markup. Varia lets you collect repeated utility lists into a component definition and expose named variants. You still use Tailwind CSS's on-demand generation, and can mix component classes with individual utilities.

## Compared with a traditional component stylesheet

A traditional component stylesheet defines selectors such as `.btn` and `.btn-primary` up front. Varia gives consumers similar class ergonomics, but generates component CSS as Tailwind CSS discovers classes in source files. You don't need to ship CSS for every class in your design system.

Slot-keyed variants activate with their variant class; compounds activate with their first condition class. See [How emission works](/reference/definitions#slot-activation).

## Compared with variant libraries

### At a glance

| | varia | CVA | tailwind-variants | vanilla-extract recipes | Panda CSS |
|---|---|---|---|---|---|
| Build-time | yes | no | no | yes | yes |
| Framework-agnostic consumption | yes | no (JS only) | no (JS only) | yes (any HTML) | no (React/Vue/Svelte/Solid) |
| Readable class names | yes | yes | yes | hashed | hashed |
| Owns the CSS pipeline | no (Tailwind CSS) | no | no | yes | yes |
| Slot support | yes | no | yes | no | no |
| Compound variants | yes | yes | yes | yes | yes |
| Theming via CSS variables | yes (recommended pattern) | manual | manual | yes | yes |
| Runtime cost | none | small | small | none | none |

## When to pick `varia`

- You want regular component classes with on-demand CSS generation.
- You want to keep shared utility lists in component definitions and select variants in markup.
- You need the same component styles in Rails ERB, Phoenix HEEx, Astro, Liquid, or other templates.
- You use Tailwind CSS or want to adopt it.
- You want names such as `btn-c-primary` that you can search for and target in CSS.

## When to pick something else

### CVA (`class-variance-authority`)

Varia uses a variant configuration similar to CVA. CVA returns a function such as `button({ color: 'primary' })` to assemble class strings. Varia registers class names with Tailwind CSS for use in markup.

Pick CVA if:

- You want to select variants through a JavaScript function in your components.
- You need default variants computed at the call site (CVA does this at runtime).
- You don't mind the small runtime cost.
- You don't need consumption from non-JS template languages.

### tailwind-variants

Pick `tailwind-variants` if:

- You're React-first and want the slots-and-compounds API as a runtime function call from JSX.
- You don't care about consumption from non-JS template languages.

`tailwind-variants` supports slots and compound variants through a JavaScript function. Varia defines slots and compounds at build time, then lets templates use the class names directly.

### vanilla-extract recipes

Pick `vanilla-extract` recipes if:

- You want a fully build-time CSS pipeline that doesn't depend on Tailwind.
- You're comfortable with hashed class names, and have tooling that doesn't grep for class strings.
- You want first-class typed CSS values in TypeScript, not just utility strings.

vanilla-extract generates its own CSS. Varia uses Tailwind CSS for CSS generation.

### Panda CSS

Panda includes recipes and a CSS generation system. Varia uses Tailwind CSS and exposes component styles as readable class names.

Pick Panda if:

- You want a complete framework-coupled styling solution (recipes, patterns, conditions, semantic tokens, layout primitives) all in one tool.
- You're committed to React, Vue, Svelte, or Solid.
- Hashed atomic class names are acceptable.

## Compared with manual Tailwind component classes

You can write component classes with `@apply` in CSS, or register each one with a Tailwind plugin. Varia groups base styles, slots, variant values, and compounds in one definition. It validates identifiers and collisions and registers classes with Tailwind.

Manual CSS works well for a few classes. Varia helps when you want consistent variant names and on-demand generation across components.
