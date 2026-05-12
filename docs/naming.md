# Naming convention

`varia` assembles each class name by concatenating the component name, variant key, and (for multi-value variants) the variant value with single dashes. The format is fixed by design. Predictable names are easier to grep, override, and document.

## The shape

```text
component-axis-value     # multi-value variant
component-axis           # boolean variant
component                # base / root slot
component__slot          # non-root slot (slot components only)
```

## By variant shape

| Variant shape | Author writes | Generated class |
|---|---|---|
| Base only | `defineComponent('btn', { base: '...' })` | `btn` |
| Multi-value | `s: { lg: '...' }` | `btn-s-lg` |
| Multi-value with numeric value | `s: { 1: '...' }` | `btn-s-1` |
| Multi-value with kebab value | `s: { '2xl': '...' }` | `btn-s-2xl` |
| Boolean | `outline: '...'` | `btn-outline` |
| Slot (root) | `slots: { root: '...' }` | `modal` |
| Slot (non-root) | `slots: { container: '...' }` | `modal__container` |

## Rules

1. The component name is always the prefix. Searching for `btn-` finds every button class in the codebase.

2. The variant axis name is the second segment. Whatever you type as the key is used verbatim: `c`, `color`, `colour`, `theme`, `bg-color`. The library does no abbreviation, no inference.

3. For multi-value variants, the variant value is the third segment, joined with a single dash.

4. For boolean variants, there is no third segment:

   ```text
   btn-outline       ✓
   btn-outline-true  ✗  (never emitted)
   ```

   The off state is the absence of the class. If you need explicit off styling, use a multi-value variant with named values (`state: { open, closed }`).

5. Every assembled class must match `/^[a-z][a-z0-9-]*$/`: lowercase plus kebab-case, starting with a letter. Validation runs at config time, on the assembled class rather than individual segments. This is why numeric values like `1`, `2xl`, `100` work: the assembled string (`btn-s-1`, `btn-s-2xl`, `btn-bg-100`) starts with the letter from the component-name prefix and stays in the allowed character set.

6. Slot classes use the BEM `__` (double-underscore) suffix. The `root` slot maps to the bare component name; every other slot is `component__slot`. The slot name itself must match `/^[a-z][a-z0-9-]*$/`. The combined `component__slot` form is the only place double underscores appear in `varia` class names.

## Slots vs. variants: the two separators

```text
modal              # root slot (bare name)
modal__container   # non-root slot (double underscore)
modal-size-md      # variant (single dashes)
```

The two never collide. Slot classes always have `__` in them; variant classes never do. Validation enforces this: a slot name can't contain underscores, and a variant axis or value can't either, so the `__` only ever appears as the slot separator. A reader (or a regex) can tell which kind of class they're looking at without context.

## Compound variants emit no class

`compoundVariants` rules don't produce a consumer-facing class. They emit a CSS rule with a chained-class selector built from the conditions:

```text
.btn-s-xs.btn-square { ... }     # compound rule for `when: { s: 'xs', square: true }`
```

The consumer writes the individual variant classes (`btn-s-xs btn-square`) and the compound CSS applies automatically. There is no `btn-compound-1` or `btn-s-xs-square` class to remember.

## Why these rules

- **Lowercase only.**

  ```text
  btn-c-Primary  ✗  silently a different class from btn-c-primary
  ```

  Matches the UnoCSS and Tailwind utility convention; case-sensitive class names are too easy a foot-gun.

- **Kebab-case only (no underscores).**

  ```text
  bg-[hsl(0_0%_50%)]   # underscores inside arbitrary values mean spaces
  ```

  Matches Tailwind utilities (`text-sm`, not `text_sm`). Avoids overloading the meaning of `_`.

- **Single-dash separator everywhere.** No mental model of "when it's a dash vs. a colon vs. a double-dash." Always a dash.

- **No abbreviation magic.** The axis name you write is the axis name in the class:

  ```text
  axis: c       produces  btn-c-primary
  axis: color   produces  btn-color-primary
  ```

  The library has no opinion.

## What this enables

The rigid format means consumers can override (`<button class="btn btn-c-primary !bg-blue-500">`), lint (`VariaClasses` union from `varia/types`), and grep (`grep -r 'btn-'` finds every button class) without needing project-specific conventions.

## Edge case: identifier conflicts

If two components emit the same class, or a component name collides with a UnoCSS utility, the build either throws or silently picks one. See [Identifier conflicts](/troubleshooting#identifier-conflicts) in Troubleshooting for the worked example.
