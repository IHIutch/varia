# Button

A button with three independent variant axes: color, style, and size. The color × style matrix is expressed via `compoundVariants` — one explicit rule per (color, style) cell — keeping the recipe direct and the call sites readable.

## Authoring

```ts
// recipes/button.config.ts
import { defineComponent } from 'varia'

// Map each semantic color to a UnoCSS palette tone. Five colors keep the
// example tight; the same shape extends to as many as a real design system
// needs.
const COLORS = {
  primary: 'blue',
  success: 'emerald',
  danger: 'red',
  warning: 'amber',
  neutral: 'gray',
} as const

type Color = keyof typeof COLORS

// For each color, produce one compound rule per style. The compound sets the
// concrete colours (bg, border, text, hover-bg); the `c` and `style` shortcuts
// just carry properties that stay constant across the matrix.
function compoundsFor(c: Color) {
  const t = COLORS[c]
  return [
    { when: { c, style: 'solid' }, class: `bg-${t}-600 border-${t}-600 hover:bg-${t}-700` },
    { when: { c, style: 'outline' }, class: `text-${t}-700 border-${t}-300 hover:bg-${t}-50` },
    { when: { c, style: 'subtle' }, class: `bg-${t}-50 text-${t}-700 hover:bg-${t}-100` },
    { when: { c, style: 'ghost' }, class: `text-${t}-700 hover:bg-${t}-50` },
  ]
}

export default defineComponent('btn', {
  base: [
    'inline-flex items-center justify-center rounded-md font-medium border',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  variants: {
    c: {
      primary: 'focus-visible:ring-blue-500',
      success: 'focus-visible:ring-emerald-500',
      danger: 'focus-visible:ring-red-500',
      warning: 'focus-visible:ring-amber-500',
      neutral: 'focus-visible:ring-gray-500',
    },
    style: {
      solid: 'text-white',
      outline: 'bg-transparent',
      subtle: 'border-transparent',
      ghost: 'bg-transparent border-transparent',
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
  compoundVariants: (Object.keys(COLORS) as Color[]).flatMap(compoundsFor),
})
```

Two things to call out:

1. **`c` and `style` carry only the constant properties.** `c.primary` sets `focus-visible:ring-blue-500` — same regardless of style. `style.solid` sets `text-white` — same regardless of color. Everything that depends on *both* axes (background, border, hover background, the colored text in outline/subtle/ghost) lives in the compound rules.

2. **Compounds are generated programmatically.** The `compoundsFor` helper produces the four rules for each color. Adding a sixth color is one entry in `COLORS`; the helper handles the rest. The `${t}` template-literal interpolation runs at recipe-load time, so UnoCSS sees fully-resolved utility strings (`bg-blue-600`, never `bg-${t}-600`).

## Live preview

:::raw
<div class="flex flex-wrap items-center gap-3 my-6 p-6 border border-gray-200 rounded-md bg-gray-50 vp-raw">
  <button class="btn btn-c-primary btn-style-solid btn-s-md">Save</button>
  <button class="btn btn-c-danger btn-style-outline btn-s-md">Delete</button>
  <button class="btn btn-c-success btn-style-subtle btn-s-md">Continue</button>
  <button class="btn btn-c-neutral btn-style-ghost btn-s-md">Cancel</button>
  <button class="btn btn-c-primary btn-style-solid btn-s-md" disabled>Loading…</button>
</div>

<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 vp-raw">
  <p class="mb-3 text-sm text-gray-700">All four styles, primary color, three sizes:</p>
  <div class="flex flex-wrap items-end gap-3">
    <button class="btn btn-c-primary btn-style-solid btn-s-sm">Solid sm</button>
    <button class="btn btn-c-primary btn-style-solid btn-s-md">Solid md</button>
    <button class="btn btn-c-primary btn-style-solid btn-s-lg">Solid lg</button>
    <button class="btn btn-c-primary btn-style-outline btn-s-md">Outline</button>
    <button class="btn btn-c-primary btn-style-subtle btn-s-md">Subtle</button>
    <button class="btn btn-c-primary btn-style-ghost btn-s-md">Ghost</button>
  </div>
</div>
:::

## Consumption

```html
<button class="btn btn-c-primary btn-style-solid btn-s-md">Save</button>
<button class="btn btn-c-danger btn-style-outline btn-s-md">Delete</button>
<button class="btn btn-c-success btn-style-subtle btn-s-md">Continue</button>
<button class="btn btn-c-neutral btn-style-ghost btn-s-md">Cancel</button>
<button class="btn btn-c-primary btn-style-solid btn-s-md" disabled>Loading…</button>
```

Three classes per button: color, style, size. The base class (`btn`) carries state styling (`hover:`, `focus-visible:`, `disabled:`) once for all combinations.

## What's being demonstrated

- **Three orthogonal axes at the call site.** Consumer writes `btn-c-primary btn-style-solid btn-s-md` — readable, grep-able, no synthetic identifiers like `btn-primary-solid-md`.
- **Constant properties on the shortcut, color-specific properties in compounds.** `style.solid` carrying just `text-white` (constant for all colors) and `c.primary` carrying just `focus-visible:ring-blue-500` (constant across styles) means the compounds stay focused on only what genuinely depends on both axes.
- **State pseudo-classes live on `base`.** Hover, focus-visible, and disabled apply across the entire matrix once.
- **Compounds are generated, not hand-written.** A 5×4 matrix is 20 rules. The `compoundsFor` helper makes adding a sixth color a one-line change.

## Generated class names

| Class | Purpose |
|---|---|
| `btn` | Base styling (state, transitions, focus ring scaffolding) |
| `btn-c-primary` / `-success` / `-danger` / `-warning` / `-neutral` | Color (carries focus-ring tint, used as a compound-match key) |
| `btn-style-solid` / `-outline` / `-subtle` / `-ghost` | Style (carries the cross-color constant for that style) |
| `btn-s-sm` / `-md` / `-lg` | Size |

The compound rules don't get their own consumer-facing class names; they fire automatically when both `btn-c-*` and `btn-style-*` are present on the same element.

## Customizing

Three common edits:

- **Remap a color to a different palette tone.** Change one entry in `COLORS`: `primary: 'green'` instead of `'blue'`. The helper rebuilds all four primary compounds with `bg-green-600`, `text-green-700`, etc.
- **Add a new color.** Add `accent: 'purple'` to `COLORS` and a `c.accent: 'focus-visible:ring-purple-500'` shortcut. The helper produces the four new compounds automatically.
- **Add a new style.** Add a `style.link: …` shortcut and extend `compoundsFor` with a fifth entry per color.

## When compound variants are the right shape

The button uses `compoundVariants` because the color × style matrix has a genuine cross-axis dependency: the background color of a "solid primary" button is `blue-600`, but a "solid danger" button is `red-600` and an "outline primary" button has no background at all. There's no way to compute that from `c` alone or `style` alone — the cell value needs both axes.

The trade-off: compound rules emit unconditionally (they're preflight CSS, not JIT shortcuts), so all 20 ship in your bundle even if your page only uses two of them. At this matrix size, that's a few hundred bytes; at much larger matrices (every Tailwind palette color, say) it would be worth reconsidering.

The [Icon button recipe](/recipes/icon-button) shows compound variants with a different shape: `square × size`, where the compound is essential because each cell sets a different CSS property (`padding`, not just a different padding value).

## See also

- [Icon button recipe](/recipes/icon-button) — compound variants where each cell sets fundamentally different properties.
- [Form input recipe](/recipes/form-input) — orthogonal axes with state as a variant.
- [Naming convention](/naming) — the formal rules for assembled class names.
