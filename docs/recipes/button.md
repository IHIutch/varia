# Button

The flagship recipe. A button is the right shape to demonstrate the library's strongest pattern: three orthogonal axes (color, style, size), per-component CSS variables driven by the project's UnoCSS palette, and no per-(color×style) cell explosion.

## Authoring

```ts
// recipes/button.config.ts
import { defineComponent } from 'varia'

const COLORS = ['primary', 'success', 'danger', 'warning', 'info', 'neutral'] as const
type Color = (typeof COLORS)[number]

// Map each semantic color to a UnoCSS palette tone. Forking this map is
// how a consumer remaps `primary` to a different hue.
const TONES: Record<Color, string> = {
  primary: 'blue',
  success: 'emerald',
  danger: 'red',
  warning: 'amber',
  info: 'sky',
  neutral: 'gray',
}

// Each color sets seven per-component CSS variables from the palette.
// theme() resolves at build time, so swapping TONES (or the UnoCSS theme
// itself) updates every button automatically.
//   colorVars('blue') → '[--btn-bg:theme(colors.blue.600)] [--btn-bg-hover:theme(colors.blue.700)] …'
function colorVars(tone: string): string {
  return [
    '[--btn-bg:theme(colors.' + tone + '.600)]',
    '[--btn-bg-hover:theme(colors.' + tone + '.700)]',
    '[--btn-text:theme(colors.' + tone + '.700)]',
    '[--btn-border:theme(colors.' + tone + '.300)]',
    '[--btn-bg-subtle:theme(colors.' + tone + '.50)]',
    '[--btn-bg-muted:theme(colors.' + tone + '.100)]',
    '[--btn-focus-ring:theme(colors.' + tone + '.500)]',
  ].join(' ')
}

export default defineComponent('btn', {
  base: [
    'inline-flex items-center justify-center rounded-md font-medium border',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--btn-focus-ring,theme(colors.gray.500))]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  variants: {
    c: Object.fromEntries(COLORS.map(c => [c, colorVars(TONES[c])])) as Record<Color, string>,
    style: {
      solid: 'bg-[var(--btn-bg)] text-white border-[var(--btn-bg)] hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-bg-hover)]',
      outline: 'bg-transparent text-[var(--btn-text)] border-[var(--btn-border)] hover:bg-[var(--btn-bg-subtle)]',
      subtle: 'bg-[var(--btn-bg-subtle)] text-[var(--btn-text)] border-transparent hover:bg-[var(--btn-bg-muted)]',
      ghost: 'bg-transparent text-[var(--btn-text)] border-transparent hover:bg-[var(--btn-bg-subtle)]',
    },
    s: {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
})
```

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

Three classes per button: color, style, size. The base class (`btn`) carries the state styling (`hover:`, `focus-visible:`, `disabled:`) once for all combinations.

## What's being demonstrated

- **Three orthogonal axes.** Six colors × four styles × three sizes is `6 + 4 + 3 = 13` named variants, not `6 × 4 × 3 = 72`. The combinatorics stay linear because color and style compose at the call site through per-component CSS vars.
- **Palette-driven colors.** `theme(colors.blue.600)` resolves at build time. Swapping a consumer's UnoCSS palette swaps every button color without touching the recipe. Forking the `TONES` map to remap `primary -> green` is a one-line change.
- **Color stays explicit in markup.** `btn-c-primary` reads as "primary button." No ancestor context to track.
- **State pseudo-classes belong on `base`.** Hover/focus-visible/disabled live on the base class once. Color and style don't need to repeat them.

## Generated class names

| Class | Purpose |
|---|---|
| `btn` | Base styling (state, transitions, focus ring) |
| `btn-c-primary` / `-success` / `-danger` / `-warning` / `-info` / `-neutral` | Color (sets per-component CSS vars from the palette) |
| `btn-style-solid` / `-outline` / `-subtle` / `-ghost` | Shape (consumes the CSS vars) |
| `btn-s-sm` / `-md` / `-lg` | Size |

Thirteen classes. Consumers pay for what they reference.

## Customizing

The recipe is a starting point. Three common customizations:

- **Remap a color to a different palette tone.** Edit `TONES`: `primary: 'green'` instead of `'blue'`. The button now uses `theme(colors.green.600)` etc.
- **Add a new color.** Add `accent: 'purple'` to `TONES` and `accent` to `COLORS`. The button now accepts `btn-c-accent`.
- **Add a new style.** Add `link: 'bg-transparent text-[var(--btn-text)] underline decoration-2 underline-offset-2 border-transparent hover:no-underline'` to the `style` variant. The button now accepts `btn-style-link`.

For wrapper-driven theming (one class on an ancestor reskins every component in the subtree, dark mode flips automatically) see the [Theming deep-dive](/theming).

## Alternative pattern: compound variants

The recipe above handles the color × style matrix through per-component CSS variables: `color` sets vars from the palette, and `style` consumes them. That keeps the variant count at `6 + 4 = 10` instead of `6 × 4 = 24`. It works because color and style are **independent**. A color knows nothing about a style, a style knows nothing about a color; they only meet at runtime via the variable indirection.

The other legitimate way to express the same matrix is **compound variants**, declaring each of the 24 color × style combinations explicitly:

```ts
defineComponent('btn', {
  base: '…',
  variants: {
    c: { primary: '', danger: '', /* ... */ },        // boolean markers, no styles
    style: { solid: '', outline: '', /* ... */ },
    s: { sm: 'px-2.5 py-1 text-sm', /* ... */ },
  },
  compoundVariants: [
    { when: { c: 'primary', style: 'solid' },   class: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' },
    { when: { c: 'primary', style: 'outline' }, class: 'bg-transparent text-blue-700 border-blue-300 hover:bg-blue-50' },
    { when: { c: 'danger',  style: 'solid' },   class: 'bg-red-600 text-white border-red-600 hover:bg-red-700' },
    // ... 21 more rules ...
  ],
})
```

### When each pattern is right

**Use per-component CSS variables (this recipe) when:**

- The axes are independent: a color cell looks like a color cell regardless of which style is chosen.
- The cells differ only in **values**, not in **CSS properties**. (Every cell sets `background-color` and `color`; the values differ.)
- You want the matrix to scale linearly. Adding a 7th color costs one new variant, not four.
- You want consumers to be able to swap the palette in one place (the `TONES` map or the UnoCSS theme) and have every cell update automatically.

**Use compound variants when:**

- The cells genuinely differ in which CSS properties they set. For example, `square × size`: the compound applies `padding` (one property), while the rest applies `padding-inline` + `padding-block`. CSS variables can't switch which property an expansion writes to.
- The matrix is small and fixed: three or four axes with two or three values each, not "every palette color." Compound count is the product; 6×4 is 24 rules.
- One axis is a feature flag (`square`, `loading`, `dismissible`) that meaningfully changes layout when combined with another axis, rather than just changing values.

For the Button specifically, the per-variable pattern is the better fit because all 24 cells set the same properties with different values, and the palette is exactly where you want changes to land. The [Icon button recipe](/recipes/icon-button) shows compound variants in their natural habitat: `square × size`, where each cell needs a fundamentally different `padding` value that can't be parameterized.

The two patterns also **compose**: a button could have `c × style` handled by per-variable indirection AND a `loading × size` compound rule on top, if both kinds of axes appeared on the same component.

## See also

- [Icon button recipe](/recipes/icon-button): the canonical compound-variants example.
- [Form input recipe](/recipes/form-input): same orthogonal-axes pattern with state being the leading axis.
- [Theming deep-dive](/theming): when you need cross-component reskinning, semantic tokens, or automatic dark mode.
- [Naming convention](/naming): the formal rules for assembled class names.
