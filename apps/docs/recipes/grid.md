# Grid (row + col)

A Bootstrap-style twelve-column grid expressed as two cooperating components: a `row` flex container and `col` children that opt into explicit widths via `col-span-N`. Responsive behavior is delegated to UnoCSS's variant prefixes (`md:`, `lg:`, etc.) instead of breakpoint-embedded class names.

## Authoring

```ts
// recipes/row.config.ts
import { defineComponent } from 'varia'

export default defineComponent('row', {
  // The horizontal gutter is the `--row-gx` custom property. The row's
  // negative margin pulls col paddings outside its content box; cols
  // inherit `--row-gx` via the cascade and apply the matching internal
  // padding. `gap-y-*` is safe because vertical gap doesn't interact with
  // horizontal sibling widths.
  base: 'flex flex-wrap mx-[calc(var(--row-gx,0)/-2)]',
  variants: {
    gx: {
      0: '[--row-gx:0]',
      1: '[--row-gx:0.25rem]',
      2: '[--row-gx:0.5rem]',
      3: '[--row-gx:1rem]',
      4: '[--row-gx:1.5rem]',
      5: '[--row-gx:3rem]',
    },
    gy: {
      0: 'gap-y-0', 1: 'gap-y-1', 2: 'gap-y-2',
      3: 'gap-y-4', 4: 'gap-y-6', 5: 'gap-y-12',
    },
    // Shorthand: sets both axes.
    g: {
      0: '[--row-gx:0] gap-y-0',
      3: '[--row-gx:1rem] gap-y-4',
      // ... 1, 2, 4, 5 follow the same shape
    },
  },
})
```

```ts
// recipes/col.config.ts
import { defineComponent } from 'varia'

export default defineComponent('col', {
  // `flex-1` = Bootstrap's bare `.col` (equal-width flex sibling).
  // `px-[calc(...)]` reads the gutter from the parent row.
  base: 'flex-1 px-[calc(var(--row-gx,0)/2)]',
  variants: {
    span: {
      auto: 'flex-none w-auto',
      1: 'flex-none w-1/12',
      2: 'flex-none w-2/12',
      // ...
      12: 'flex-none w-full',
    },
    offset: {
      0: 'ml-0', 1: 'ml-1/12', /* ... up to 11 */
    },
    order: {
      first: 'order-first', last: 'order-last',
      0: 'order-0', 1: 'order-1', /* ... up to 5 */
    },
  },
})
```

Three things to call out:

1. **Gutters use padding + negative margin, not `gap`.** `gap` sits between siblings, so the total horizontal space consumed by N siblings is `N × width + (N-1) × gap`. With explicit fractional widths that sum to 100%, the gap pushes the last sibling onto the next row. Bootstrap's padding-on-col + negative-margin-on-row pattern avoids this: with `box-sizing: border-box`, an explicit `w-6/12` includes the padding, so two siblings still total exactly 100%.

2. **The gutter flows through a CSS custom property.** Setting `row-gx-3` writes `--row-gx: 1rem` on the row element; cols inherit the variable and use it for symmetric horizontal padding. One source of truth, no coordination required between the row's variant and the col's padding value.

3. **`col`'s base is `flex-1` — the bare `.col` behavior.** When you add `col-span-N`, that variant carries `flex-none` to cancel the base's flex-grow and `w-N/12` to set the explicit width.

## The `row > col > content` pattern

The `col` element is structural: it owns the explicit width and the internal gutter padding. **Don't put styling utilities (backgrounds, content padding, borders) on the col itself** — they'll either stomp the gutter padding or visually consume it, making siblings appear flush. Put the styled content inside the col:

```html
<div class="row row-g-3">
  <div class="col col-span-6">
    <div class="bg-blue-100 p-3 rounded">content here</div>
  </div>
  <div class="col col-span-6">
    <div class="bg-blue-100 p-3 rounded">content here</div>
  </div>
</div>
```

This matches Bootstrap's convention. The col is the layout slot; the inner element is the visual cell.

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 space-y-4 vp-raw">
  <p class="text-sm text-gray-700">Three equal-width columns (bare <code>.col</code>):</p>
  <div class="row row-g-3">
    <div class="col"><div class="bg-blue-100 p-2 rounded">A</div></div>
    <div class="col"><div class="bg-blue-100 p-2 rounded">B</div></div>
    <div class="col"><div class="bg-blue-100 p-2 rounded">C</div></div>
  </div>

  <p class="text-sm text-gray-700">Explicit widths (<code>span-8</code> + <code>span-4</code>):</p>
  <div class="row row-g-3">
    <div class="col col-span-8"><div class="bg-emerald-100 p-2 rounded">span 8</div></div>
    <div class="col col-span-4"><div class="bg-emerald-100 p-2 rounded">span 4</div></div>
  </div>

  <p class="text-sm text-gray-700">With offset (<code>offset-2</code>):</p>
  <div class="row row-g-3">
    <div class="col col-span-4 col-offset-2"><div class="bg-amber-100 p-2 rounded">span 4, offset 2</div></div>
    <div class="col col-span-4"><div class="bg-amber-100 p-2 rounded">span 4</div></div>
  </div>

  <p class="text-sm text-gray-700">Reordered (<code>order-last</code> on the first item):</p>
  <div class="row row-g-3">
    <div class="col col-span-4 col-order-last"><div class="bg-red-100 p-2 rounded">first in source, last visually</div></div>
    <div class="col col-span-4"><div class="bg-red-100 p-2 rounded">B</div></div>
    <div class="col col-span-4"><div class="bg-red-100 p-2 rounded">C</div></div>
  </div>
</div>
:::

## Consumption

```html
<div class="row row-g-3">
  <div class="col col-span-12 md:col-span-6 lg:col-span-4">
    <article class="bg-white p-4 rounded shadow-sm">A</article>
  </div>
  <div class="col col-span-12 md:col-span-6 lg:col-span-4">
    <article class="bg-white p-4 rounded shadow-sm">B</article>
  </div>
  <div class="col col-span-12 md:col-span-6 lg:col-span-4">
    <article class="bg-white p-4 rounded shadow-sm">C</article>
  </div>
</div>
```

The `md:` and `lg:` prefixes work because UnoCSS resolves them against the shortcut's underlying utilities. `md:col-span-6` becomes `md:w-1/2 md:flex-none` at build time — same media-query mechanism Tailwind uses on its own utilities.

## Generated class names

| Class | Purpose |
|---|---|
| `row` | Flex container with `flex-wrap` |
| `row-g-{0..5}` | Gutter (both axes) |
| `row-gx-{0..5}` | Gutter (horizontal) |
| `row-gy-{0..5}` | Gutter (vertical) |
| `col` | Bare column (equal-width flex sibling) |
| `col-span-{auto, 1..12}` | Explicit width |
| `col-offset-{0..11}` | Left margin offset |
| `col-order-{first, last, 0..5}` | Flex order |

## Comparison with Bootstrap's class shape

Bootstrap's literal classes embed breakpoints (`col-md-6`, `offset-lg-2`); varia's naming convention is `component-axis-value` with no slot for a breakpoint segment. Two consequences:

- **Class shape differs.** Where Bootstrap writes `col-md-6`, varia uses `md:col-span-6`. The leading `md:` is UnoCSS's variant prefix, which it strips when emitting the media-queried CSS rule. Same outcome, different shape.
- **Offset / order classes are namespaced under `col`.** Bootstrap has `.offset-2` standing alone; varia emits `col-offset-2`. The semantics are the same — both apply to a column element — but the class name reflects that.

If you want Bootstrap-literal class names (`col-md-6`, `offset-2`), you'd need one component per breakpoint and standalone `offset`/`order` components. That's roughly 250 shortcuts for full coverage; the variant-prefix approach above is roughly 30.

## What's not included

- **Container.** Bootstrap's `.container` (max-width with horizontal padding) is one base shortcut — fits a `defineComponent('container', { ... })` with size variants if you need it.
- **Responsive gutters.** `md:row-g-3` works (UnoCSS resolves the prefix against the shortcut), so no separate variant needed.
- **`row-cols-N`** (Bootstrap's "force N equal columns inside the row"). Achievable as a `cols` variant on `row` setting `grid-cols-N` and switching base to `grid`, but that conflicts with the flex base. Easier to write explicit `col-span-*` values per child.
