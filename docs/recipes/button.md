# Button

Color (`c`), style, and size (`s`) variants.

## Recipe

Copy this definition and change its import to `variacss`.

The base defines shared layout, focus, and disabled styles. Color sets the focus ring; style sets shared appearance. Compounds set properties that depend on both:

<<< ../../recipes/button.config.ts

Color is first in `when`. Using `btn-c-primary` emits all four primary style compounds; their selectors check the style class. Consider this grouped output before expanding the matrix.

## Live preview

:::raw
<div class="flex flex-wrap items-center gap-3 my-6 p-6 border border-gray-200 rounded-md bg-gray-50 vp-raw">
  <button class="btn btn-c-primary btn-style-solid btn-s-md">Save</button>
  <button class="btn btn-c-danger btn-style-outline btn-s-md">Delete</button>
  <button class="btn btn-c-success btn-style-subtle btn-s-md">Continue</button>
  <button class="btn btn-c-neutral btn-style-ghost btn-s-md">Cancel</button>
  <button class="btn btn-c-primary btn-style-solid btn-s-md" disabled>Loading...</button>
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

## Usage

```html
<button class="btn btn-c-primary btn-style-solid btn-s-md">Save</button>
<button class="btn btn-c-danger btn-style-outline btn-s-sm">Delete</button>
```

To add a color, define its focus-ring variant and a compound per style. To change a palette, edit those compounds and the focus ring.
