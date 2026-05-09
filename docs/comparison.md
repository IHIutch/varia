# Comparison

::: tip Draft
This page is a first draft. The positioning vs. Panda CSS in particular is a judgment call. Pull requests welcome if anything reads as unfair to a peer project.
:::

`varia` lives in a small but real gap between Tailwind/UnoCSS utilities and traditional CSS components. The closest peers each occupy a slightly different point in the design space; the most useful question is "when would you pick this?"

## At a glance

| | varia | CVA | tailwind-variants | vanilla-extract recipes | Panda CSS |
|---|---|---|---|---|---|
| Build-time | yes | no | no | yes | yes |
| Framework-agnostic consumption | yes | no (JS only) | no (JS only) | yes (any HTML) | no (React/Vue/Svelte/Solid) |
| Readable class names | yes | yes | yes | hashed | hashed |
| Owns the CSS pipeline | no (UnoCSS) | no | no | yes | yes |
| Slot support | no (v2) | no | yes | no | no |
| Compound variants | no (v2) | yes | yes | yes | yes |
| Theming via CSS variables | yes (recommended pattern) | manual | manual | yes | yes |
| Runtime cost | none | small | small | none | none |

## When to pick `varia`

- You're building a design-system or component library that ships a vocabulary, not a runtime.
- Consumers come from many ecosystems (Rails + ViewComponent, Astro, Eleventy, Hugo, Phoenix HEEx, Django) and you want one library that works across all of them.
- You're already using UnoCSS, or are happy to adopt it.
- You want readable, grep-able class names (`btn-c-primary`) instead of hashed atomic IDs.

## When to pick something else

### CVA (`class-variance-authority`)

Pick CVA if:
- You're shipping a React/Vue/Svelte component library and want a callable API: `cva(...)` returns a function consumers call from JSX.
- You need default variants at the call site (CVA computes them at runtime).
- You don't mind the small runtime cost.
- You don't care about consumption from non-JS template languages.

CVA is the API-shape ancestor of `varia`; the config feels almost identical. The fundamental difference: CVA returns a function, `varia` returns class names you write in HTML.

### tailwind-variants

Pick `tailwind-variants` if:
- You like CVA's shape but need slots for multi-element components today.
- You're React-first and don't care about non-JS consumers.

`tailwind-variants` is roughly CVA plus slots. The slots story is what `varia` defers to v2.

### vanilla-extract recipes

Pick `vanilla-extract` recipes if:
- You want a fully build-time CSS pipeline that doesn't depend on Tailwind/UnoCSS.
- You're comfortable with hashed class names, and have tooling that doesn't grep for class strings.
- You want first-class typed CSS values in TypeScript, not just utility strings.

vanilla-extract owns its own extractor and CSS engine. `varia` deliberately doesn't; UnoCSS does that part.

### Panda CSS

Pick Panda if:
- You want a complete framework-coupled styling solution (recipes, patterns, conditions, semantic tokens, layout primitives) all in one tool.
- You're committed to React, Vue, Svelte, or Solid.
- Hashed atomic class names are acceptable.

Panda is the closest peer to `varia` in concept: recipes are similar to variants, both are build-time, both are JIT. Panda differs on three axes: it's framework-coupled, it owns its own CSS engine, and it emits hashed class names. If you need Panda's depth, take it. `varia` is intentionally a smaller surface.

## Why `varia` vs. just writing UnoCSS shortcuts manually

You can express the same component vocabulary by hand-writing UnoCSS shortcuts:

```ts
// unocss.config.ts (manual)
shortcuts: [
  ['btn', 'inline-block font-medium rounded'],
  ['btn-c-primary', 'bg-blue-600 text-white hover:bg-blue-700'],
  ['btn-c-danger', 'bg-red-600 text-white hover:bg-red-700'],
  ['btn-s-sm', 'px-2 py-1 text-sm'],
  // ...repeated for every variant
]
```

`defineComponent` gives you:

1. Structure. A variants-shaped config separates "this is the base" from "these are the colors" from "these are the sizes." Six shortcuts collapse into one readable block.
2. Validation. Catches duplicate names, empty expansions, and invalid identifiers at config time, with error messages that name the offending component and class.
3. Manifest output. The `VariaClasses` union for type-strict tooling, which you'd hand-roll alongside manual shortcuts.
4. Boolean shorthand. `outline: '...'` produces `btn-outline` (no value suffix). Hand-rolled shortcuts can't represent this without ad-hoc naming conventions.

If your component library has fewer than ~5 variants total, manual shortcuts are fine. Past that, the structure starts to pay off.

## A note on Panda specifically

Panda CSS is excellent at what it does. The reason `varia` exists isn't a complaint about Panda; the JS-framework coupling and hashed class names make Panda a non-option for the Rails / Phoenix / Astro / Hugo audience that ships server-rendered HTML. If you're React-first and the framework coupling is fine, try Panda first.
