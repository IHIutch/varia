# Concepts

A 5-minute orientation before the [Quickstart](/quickstart) or [API reference](/api).

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

The callable is fine in JSX. The class name works anywhere a JS function can't: Rails templates, Phoenix HEEx, Astro, Hugo, Liquid, plain HTML.

The [Comparison page](/comparison) covers this trade-off against four peer libraries.

## A 60-second UnoCSS primer

`varia` doesn't own the CSS pipeline; [UnoCSS](https://unocss.dev) does. Two UnoCSS concepts matter:

- **Atomic utilities.** Single-purpose classes UnoCSS recognises via rules and matchers, like `bg-blue-600`, `px-4`, `hover:bg-blue-700`. Tailwind-style, but generated on demand instead of from a pre-built stylesheet.
- **Shortcuts.** A shortcut maps one class name to a string of utilities. `presetVaria` generates one shortcut per variant axis × value pair and registers them with UnoCSS.

UnoCSS only emits CSS for classes it finds in your source files. A `btn-c-purple` shortcut may exist in the manifest, but if no template references it, it doesn't ship.

## Glossary

A quick lookup. Each term has a full treatment in the [API reference](/api).

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
