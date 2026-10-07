# Button

Use color, style, and size variants to select the button's appearance. The class names abbreviate color to `c` and size to `s`.

## Recipe

The base defines layout, focus, and disabled styles. The `c` variant sets the focus-ring color. The `style` variant sets text, background, or border properties shared across colors. Compounds set the properties that depend on both color and style:

<<< ../../recipes/button.config.ts

Color is first in each `when` object. When Tailwind detects `btn-c-primary`, it emits all four primary-color compound rules. Each rule matches only when its style class is also present. Adding more styles increases the CSS emitted for each detected color.

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
