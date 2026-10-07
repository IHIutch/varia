# Grid

A twelve-column flex grid. Register both the row and column definitions.

## Recipes

Copy these definitions and change their imports to `variacss`.

::: code-group

<<< ../../recipes/row.config.ts

<<< ../../recipes/col.config.ts

:::

## Gutters and widths

`row` wraps columns; bare `col` gives equal-width siblings. `col-span-N` sets an explicit width and disables flex growth.

Horizontal gutters use `--row-gx`, negative row margins, and column padding. Tailwind's border-box sizing keeps the padding inside explicit widths, so two half-width columns fit. Adding horizontal `gap` would make widths totaling 100% overflow. Vertical gutters use `gap-y-*`.

Put backgrounds, borders, and content padding on an element inside each column so they do not cover or override gutter padding.

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

## Usage

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

Use `md:row-g-3` for responsive gutters. Breakpoints follow Tailwind's theme; `md:col-span-6` replaces Bootstrap-style `col-md-6` names.

## Classes

| Class | Purpose |
| --- | --- |
| `row` | Wrapping flex container |
| `row-g-0` through `row-g-5` | Both-axis gutter |
| `row-gx-0` through `row-gx-5` | Horizontal gutter |
| `row-gy-0` through `row-gy-5` | Vertical gutter |
| `col` | Equal-width column |
| `col-span-auto`, `col-span-1` through `col-span-12` | Explicit width |
| `col-offset-0` through `col-offset-11` | Left-margin offset |
| `col-order-first`, `col-order-last`, `col-order-0` through `col-order-5` | Flex order |

Add your own max-width wrapper if needed. The recipe has no `row-cols-N` parent setting.
