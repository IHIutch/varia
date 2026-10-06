# Naming convention

Varia joins the component name, variant key, and variant value with single dashes. Boolean variants omit the value. Slots use a double underscore. These names let you search for component styles and target them in CSS.

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

1. The component name is the prefix. Searching for `btn-` finds button variant classes; the base class is `btn`.

2. The variant axis is the second segment. Varia uses the key exactly as written, whether it is `c`, `color`, `colour`, `theme`, or `bg-color`.

3. For multi-value variants, the variant value is the third segment, joined with a single dash.

4. For boolean variants, there is no third segment:

   ```text
   btn-outline       ✓
   btn-outline-true  ✗  (never emitted)
   ```

   The off state is the absence of the class. If you need explicit off styling, use a multi-value variant with named values (`state: { open, closed }`).

5. Base and variant class names must match `/^[a-z][a-z0-9-]*$/`. They start with a lowercase letter and contain lowercase letters, digits, or dashes. Varia checks the assembled name, so values such as `1`, `2xl`, and `100` are valid in `btn-s-1`, `btn-s-2xl`, and `btn-bg-100`.

6. Non-root slot classes use the BEM `__` separator. The `root` slot uses the component name; other slots use `component__slot`. Slot names must match `/^[a-z][a-z0-9-]*$/`. Only the slot separator can contain underscores.

## Slots vs. variants: the two separators

```text
modal              # root slot (bare name)
modal__container   # non-root slot (double underscore)
modal-size-md      # variant (single dashes)
```

Non-root slot classes contain `__`; variant classes use dashes. Validation prevents underscores in slot names, variant axes, and variant values.

## Compound variants emit no class

`compoundVariants` emits a CSS rule that combines the existing variant classes:

```text
.btn-s-xs.btn-square { ... }     # compound rule for `when: { s: 'xs', square: true }`
```

Write the individual variant classes, such as `btn-s-xs btn-square`. The combined selector applies the compound styles when both classes are present.

## Why these rules

- Lowercase only.

  ```text
  btn-c-Primary  ✗  silently a different class from btn-c-primary
  ```

  Lowercase names match the Tailwind utility convention and avoid names that differ only by case.

- Kebab-case only (no underscores).

  ```text
  bg-[hsl(0_0%_50%)]   # underscores inside arbitrary values mean spaces
  ```

  Dashes match utility names such as `text-sm`. Underscores already represent spaces inside arbitrary utility values.

- Variant segments always use a single dash.

- Varia preserves the axis name:

  ```text
  axis: c       produces  btn-c-primary
  axis: color   produces  btn-color-primary
  ```

  Choose the axis names you want consumers to write.

## What this enables

Use utilities to override styles, the `VariaClasses` union to check names, and text search to locate component variants. For example, `<button class="btn btn-c-primary !bg-blue-500">` overrides the background.

## Edge case: identifier conflicts

Duplicate shortcuts cause `tailwindVaria` to throw. A collision with a built-in Tailwind utility can produce both definitions. See [Identifier conflicts](/troubleshooting#identifier-conflicts) for examples.
