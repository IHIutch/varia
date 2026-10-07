# Troubleshooting

## My component has no styles

Check these in order:

1. The definition is in `tailwindVaria({ components: [...] })`.
2. Your CSS entrypoint loads that registration through `@plugin`, and your app loads the stylesheet.
3. The complete class name, such as `btn-size-lg`, appears in a template Tailwind scans. Building it from pieces like `btn-size-${size}` prevents Tailwind from finding it.

If you use `prefix(tw)` in CSS, also set `prefix: 'tw'` in `tailwindVaria`. Use `tw:btn` and `tw:md:btn-size-lg` in markup; keep utilities inside definitions unprefixed.

## Definition edits don't appear

With Vite, import the registration module in `vite.config.ts`, as shown in [Quickstart](/quickstart#development-reload). If Vite failed to start, fix the reported error and restart it.

If editor suggestions don't update after you edit an imported definition, save the CSS entrypoint to refresh them. For missing suggestions, check `Tailwind CSS: Show Output` for plugin-loading errors. Tailwind's [extension documentation](https://github.com/tailwindlabs/tailwindcss-intellisense#troubleshooting) covers project detection and settings.

## A utility doesn't override my component

Keep these imports in this order:

```css
@import "variacss/tailwind.css";
@import "tailwindcss";
```

A utility such as `px-8` then overrides normal component padding. Reordering classes in the HTML has no effect. Check for `!important` if the component still wins.

## CSS contains utilities used only in definitions

On Tailwind 4.1+, exclude definition files from Tailwind's scan:

```css
@source not "./**/*.config.ts";
```

Adjust the path to where you keep definitions. It is relative to the stylesheet. Varia still reads the definitions through your registration module.

## Slot styles affect the wrong elements

A selector such as `.panel-accent .panel__title` needs `panel-accent` on an ancestor and `panel__title` on the child. Putting both classes on the same element, or using only `md:panel__title`, won't match it.

The selector also reaches titles inside nested panels. Give the nested component a different name when it needs independent styles.

## A responsive compound doesn't apply

For `when: { size: 'lg', busy: true }`, use:

```html
<div class="notice md:notice-size-lg notice-busy">Saving</div>
```

Only the first condition accepts the modifier. Adding `md:` to `notice-busy` prevents this compound from matching. Put `busy` first in `when` if that is the condition you want to modify.

## The build reports an error

### Invalid names

Use lowercase letters, numbers, and hyphens. Component and slot names must start with a letter. Variant values such as `1` and `2xl` are allowed because they form part of a longer class name.

### Duplicate names {#identifier-conflicts}

Register each component once. Generated classes must also be unique: a `btn` component with `tone.primary` produces `btn-tone-primary`, which conflicts with a component of that name. Rename one of them.

Avoid naming components after Tailwind utilities such as `flex`, `grid`, or `hidden`; both can contribute CSS to the same class.

### Unknown utilities

Check the utility's spelling and any theme token or custom utility it needs. Expand grouped syntax such as `hover:(bg-blue-600 text-white)` into `hover:bg-blue-600 hover:text-white`.
