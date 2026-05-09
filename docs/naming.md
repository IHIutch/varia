# Naming convention

Class names in `varia` are assembled by concatenating the component name, variant key, and (for multi-value variants) the variant value with single dashes. The format is fixed by design. Predictable names are easier to grep, override, and document.

## The shape

```text
component-axis-value     # multi-value variant
component-axis           # boolean variant
component                # base
```

## By variant shape

| Variant shape | Author writes | Generated class |
|---|---|---|
| Base only | `defineComponent('btn', { base: '…' })` | `btn` |
| Multi-value | `s: { lg: '…' }` | `btn-s-lg` |
| Multi-value with numeric value | `s: { 1: '…' }` | `btn-s-1` |
| Multi-value with kebab value | `s: { '2xl': '…' }` | `btn-s-2xl` |
| Boolean | `outline: '…'` | `btn-outline` |

## Rules

1. The component name is always the prefix. Searching for `btn-` finds every button class in the codebase.

2. The variant axis name is the second segment. Whatever you type as the key is used verbatim: `c`, `color`, `colour`, `theme`, `bg-color`. The library does no abbreviation, no inference.

3. For multi-value variants, the variant value is the third segment, joined with a single dash.

4. For boolean variants, there is no third segment. `btn-outline` reads as "outlined button" rather than `btn-outline-true`. The off state is the absence of the class. If you need explicit off styling, use a multi-value variant with named values (`state: { open, closed }`).

5. Every assembled class must match `/^[a-z][a-z0-9-]*$/`: lowercase plus kebab-case, starting with a letter. Validation runs at config time, on the assembled class rather than individual segments. This is why numeric values like `1`, `2xl`, `100` work: the assembled string (`btn-s-1`, `btn-s-2xl`, `btn-bg-100`) starts with the letter from the component-name prefix and stays in the allowed character set.

## Why these rules

- **Lowercase only.** Matches the UnoCSS and Tailwind utility convention. CSS class names are case-sensitive; `btn-c-Primary` and `btn-c-primary` are silently different classes, too easy a foot-gun.

- **Kebab-case only (no underscores).** Matches Tailwind utilities (`text-sm`, not `text_sm`). Avoids visual ambiguity inside arbitrary values like `bg-[hsl(0_0%_50%)]` where underscores carry a separate meaning.

- **Single-dash separator everywhere.** Keeps the format learnable. You don't have to remember when it's a single dash vs. a double dash vs. a colon. It's always a single dash.

- **No abbreviation magic.** If your axis is named `color`, it stays `color` in the class name (`btn-color-primary`). Authors who prefer `c` get `btn-c-primary`. The library has no opinion.

## What this enables

The naming format is rigid enough that consumers can rely on it for:

- **Overrides.** To nudge a single button's color in one template, `<button class="btn btn-c-primary !bg-blue-500">`. The override goes after the named variant.
- **Linting.** `import type { VariaClasses } from 'varia/types'` exposes the union; downstream tools can build linters around it.
- **Documentation.** The class names tell you what's going on. A reviewer reading `btn-c-danger btn-s-lg btn-outline` knows the intent without opening the config.
- **Search.** Every variant of a component is reachable by `grep -r 'btn-'`. No abbreviations to hunt down.

## Edge case: identifier conflicts

If two components emit the same class (component `btn` with variant `c-primary`, and a separate component called `btn-c-primary` with `base`), `presetVaria` throws at preset construction. Pick a different name.

If a component name collides with a UnoCSS utility name (naming a component `flex`, for example), behavior depends on the order of presets and will be confusing. Avoid utility-shaped names.
