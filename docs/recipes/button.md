# Button

The flagship recipe. A button is the right shape to demonstrate the library's strongest pattern: three orthogonal axes (color, style, size), per-component CSS variables driven by the project's UnoCSS palette, and no per-(color×style) cell explosion.

## Authoring

```ts
// recipes/button.config.ts
import { defineComponent } from 'varia'

// Each color sets seven per-component CSS variables from the project's
// UnoCSS palette. `primary` uses blue; the other colors follow the same
// shape with different palette tones (emerald, red, amber, sky, gray).
// theme() resolves at build time, so changing the palette in your
// UnoCSS config swaps every button's colors automatically.

export default defineComponent('btn', {
  base: [
    'inline-flex items-center justify-center rounded-md font-medium border',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--btn-focus-ring,theme(colors.gray.500))]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  variants: {
    c: {
      primary: '[--btn-bg:theme(colors.blue.600)] [--btn-bg-hover:theme(colors.blue.700)] [--btn-text:theme(colors.blue.700)] [--btn-border:theme(colors.blue.300)] [--btn-bg-subtle:theme(colors.blue.50)] [--btn-bg-muted:theme(colors.blue.100)] [--btn-focus-ring:theme(colors.blue.500)]',
      // success, danger, warning, info, neutral all follow the same shape
      // with their own palette tones. See recipes/button.config.ts in the
      // varia repo for the full implementation (uses a small helper to DRY
      // these up).
    },
    style: {
      solid:   'bg-[var(--btn-bg)] text-white border-[var(--btn-bg)] hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-bg-hover)]',
      outline: 'bg-transparent text-[var(--btn-text)] border-[var(--btn-border)] hover:bg-[var(--btn-bg-subtle)]',
      subtle:  'bg-[var(--btn-bg-subtle)] text-[var(--btn-text)] border-transparent hover:bg-[var(--btn-bg-muted)]',
      ghost:   'bg-transparent text-[var(--btn-text)] border-transparent hover:bg-[var(--btn-bg-subtle)]',
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

## See also

- [Form input recipe](/recipes/form-input): same orthogonal-axes pattern with state being the leading axis.
- [Theming deep-dive](/theming): when you need cross-component reskinning, semantic tokens, or automatic dark mode.
- [Naming convention](/naming): the formal rules for assembled class names.
