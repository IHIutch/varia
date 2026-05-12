# Concepts

A 5-minute orientation before the [Quickstart](/quickstart) or [API reference](/api).

## What `varia` does

`varia` is a build-time variant system. You describe a component once:

```ts
defineComponent('btn', {
  base: 'inline-flex items-center rounded-md',
  variants: {
    c: { primary: 'bg-blue-600 text-white', danger: 'bg-red-600 text-white' },
    s: { sm: 'px-2 py-1', md: 'px-4 py-2' },
  },
})
```

`presetVaria` flattens that into UnoCSS shortcuts. UnoCSS expands the shortcuts into atomic CSS at build time. You write the assembled class names directly in markup:

```html
<button class="btn btn-c-primary btn-s-md">Save</button>
```

The browser sees ordinary class names. There's no runtime to load.

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

*Variant axis*: a dimension a component varies along: `c` (color), `s` (size), `outline` (boolean). The axis name appears in the assembled class: `btn-c-primary`. See [Naming convention](/naming).

*Variant value*: one option along an axis: `primary`, `danger`, `sm`. Becomes the suffix: `btn-c-primary`.

*Boolean variant*: an axis with no value, just on/off. `outline: 'border-2'` produces `btn-outline` (no `-true`). See [API reference](/api#boolean-variant).

*Multi-value variant*: an axis with named values. `s: { sm: '...', md: '...' }`. See [API reference](/api#multi-value-variant).

*Compound variant*: a rule that fires when two axes are set together. Emits CSS but no new class. See [API reference](/api#compound-variants).

*Slot*: a named part of a multi-element component. `defineComponent('modal', { slots: { header, body, footer } })` produces `modal__header`, `modal__body`, `modal__footer`. See [Modal recipe](/recipes/modal).

*Slot-keyed variant*: a variant axis whose values target specific slots. `size: { md: { container: 'max-w-md' } }` emits `.modal-size-md .modal__container { max-width: ... }`. See [API reference](/api#multi-value-slot-keyed-variant).

*Manifest*: the TypeScript file `presetVaria` writes to `node_modules/.varia/manifest.d.ts`. Exports a `VariaClasses` union of every valid class. See the [Type safety recipe](/recipes/type-safety).

## Next

- [Quickstart](/quickstart): install and define your first component.
- [API reference](/api): every option for `defineComponent`, `compoundVariants`, and `presetVaria`.
- [Recipes](/recipes/button): worked examples.
