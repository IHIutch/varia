# Grid (row + col)

A twelve-column flex grid. `row` wraps columns, and `col-span-N` sets each column's width. Use Tailwind prefixes such as `md:` and `lg:` for responsive layouts.

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
      0: 'ml-0', 1: 'ml-[calc(100%*1/12)]', /* ... up to 11 */
    },
    order: {
      first: 'order-first', last: 'order-last',
      0: 'order-0', 1: 'order-1', /* ... up to 5 */
    },
  },
})
```

The row and column styles share the gutter width:

1. Horizontal gutters use column padding and negative row margins. Adding `gap` to columns whose widths total 100% would push the last column onto a new row. With `box-sizing: border-box`, column padding stays inside the declared width, so two `w-6/12` columns still fit.

2. `row-gx-3` sets `--row-gx: 1rem` on the row. Columns inherit it and apply half that value as padding on each side.

3. The base `col` uses `flex-1` for equal-width columns. A `col-span-N` variant adds `flex-none` to disable growth and sets an explicit width.

## The `row > col > content` pattern

The `col` element sets width and gutter padding. Put backgrounds, borders, and content padding on an inner element. Styling the column itself can override or cover the gutter:

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

The outer column controls layout; the inner element holds the content styles.

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

Tailwind applies `md:` and `lg:` to the shortcut utilities. For example, `md:col-span-6` generates a media query for half-width columns with `flex-none`.

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

Bootstrap includes breakpoints in names such as `col-md-6`. Varia keeps the `component-axis-value` name and uses Tailwind prefixes for breakpoints:

- Use `md:col-span-6` where Bootstrap uses `col-md-6`. Tailwind generates the media query.
- Use `col-offset-2` where Bootstrap uses `offset-2`. Varia keeps offset and order variants under the `col` component.

Matching Bootstrap names exactly would require extra definitions for breakpoint, offset, and order classes. Tailwind prefixes let you reuse the same shortcuts at different breakpoints.

## What's not included

- Define a separate `container` component if you need a max-width wrapper with horizontal padding.
- Use prefixes such as `md:row-g-3` for responsive gutters. They need no additional definitions.
- The recipe does not provide `row-cols-N` to set the number of equal columns on the parent. Set `col-span-*` on each child instead.
