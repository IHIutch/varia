# Concepts

Varia combines on-demand CSS generation with the ergonomics of regular CSS classes. You define reusable styles and variants with UnoCSS utilities, then select them by writing component classes in your templates.

## From a definition to generated CSS

1. `defineComponent` turns base styles and variants into named UnoCSS shortcuts, such as `btn`, `btn-c-primary`, and `btn-s-lg`.
2. `presetVaria` registers those shortcuts with UnoCSS.
3. UnoCSS scans the source files configured in your project and generates CSS for the shortcuts it finds.
4. Your application loads the generated stylesheet. Templates use ordinary class strings with no Varia styling runtime.

This gives you Tailwind-style just-in-time generation while keeping repeated utility lists inside component definitions. You can use the generated names in your own CSS selectors, and mix component classes with utilities for one-off adjustments.

Varia authors styles rather than complete interactive components. Recipes are examples to adapt. Your application provides the markup and behavior, including dialog focus management and keyboard interactions.

## Why class names, not functions

CVA and tailwind-variants return JavaScript functions you call from JSX. `varia` returns class names you write in HTML.

```jsx
// CVA: callable from JSX
<button className={button({ color: 'primary', size: 'md' })}>Save</button>
```

```erb
<%# varia: works in any template language %>
<button class="btn btn-c-primary btn-s-md">Save</button>
```

Plain class strings work in Rails templates, Phoenix HEEx, Astro, Hugo, Liquid, and HTML without calling a JavaScript function.

The [Comparison page](/comparison) covers this trade-off against four peer libraries.

## UnoCSS basics

[UnoCSS](https://unocss.dev) generates the CSS. Varia uses its utilities and shortcuts:

- Atomic utilities apply individual styles, such as `bg-blue-600`, `px-4`, and `hover:bg-blue-700`. UnoCSS generates their CSS on demand.
- Shortcuts map a name to a utility list. Varia registers a shortcut for each base or slot style and each flat variant value.

For shortcuts, UnoCSS emits CSS for classes it discovers through its configured source scan or safelist. An unused `btn-c-purple` shortcut can exist in the manifest without shipping CSS.

Slot-keyed variants emit their slot rules when the variant class is scanned or safelisted. Compounds emit when the class for their first `when` condition is scanned or safelisted. Their full selectors determine when those styles apply in the browser. Unused activation classes produce no component CSS. See [How emission works](/api#how-emission-works) for details.

The build still needs a JavaScript tooling environment and a UnoCSS integration. The generated stylesheet can be consumed by any template language.

## Glossary

See the [API reference](/api) for configuration details.

| Term | Meaning |
|---|---|
| Variant axis | A dimension a component varies along: `c`, `s`, `outline`. Becomes the second segment of the class: `btn-c-primary`. |
| Variant value | One option along an axis: `primary`, `sm`. Becomes the third segment. |
| Boolean variant | An axis with no value, just on/off. `outline: 'border-2'` produces `btn-outline` (no `-true`). |
| Multi-value variant | An axis with named values: `s: { sm, md, lg }`. |
| Compound variant | A rule that fires when two axes are set together. Emits CSS but no new class. |
| Slot | A named part of a multi-element component. Produces `component__slot` classes. |
| Slot-keyed variant | A variant whose values target specific slots, emitted as descendant rules. |
| Manifest | The TypeScript file `presetVaria` writes to `node_modules/.varia/manifest.d.ts`. Exports a `VariaClasses` union of every valid class. |
