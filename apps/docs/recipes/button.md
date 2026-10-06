# Button

A button with color, style, and size variants. Compound rules define the styles for each color and style combination.

## Authoring

```ts
// recipes/button.config.ts
import { defineComponent } from 'varia'

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
  compoundVariants: [
    // primary (blue)
    { when: { c: 'primary', style: 'solid' },   class: 'bg-blue-600 border-blue-600 hover:bg-blue-700' },
    { when: { c: 'primary', style: 'outline' }, class: 'text-blue-700 border-blue-300 hover:bg-blue-50' },
    { when: { c: 'primary', style: 'subtle' },  class: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { when: { c: 'primary', style: 'ghost' },   class: 'text-blue-700 hover:bg-blue-50' },

    // success (emerald)
    { when: { c: 'success', style: 'solid' },   class: 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' },
    { when: { c: 'success', style: 'outline' }, class: 'text-emerald-700 border-emerald-300 hover:bg-emerald-50' },
    { when: { c: 'success', style: 'subtle' },  class: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { when: { c: 'success', style: 'ghost' },   class: 'text-emerald-700 hover:bg-emerald-50' },

    // danger (red), warning (amber), neutral (gray) follow the same shape;
    // see the source for the full 20-entry list.
  ],
})
```

The shortcuts define shared properties; the compounds define combinations:

1. `c.primary` sets the focus-ring color for every primary style. `style.solid` sets white text for every solid color. Compound rules define properties that depend on both axes, including backgrounds, borders, hover colors, and text colors for outline, subtle, and ghost styles.

2. Tailwind resolves compound utilities and emits the palette variables they reference. This recipe lists all five colors and four styles explicitly so each combination can be reviewed together.

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

## Consumption

```html
<button class="btn btn-c-primary btn-style-solid btn-s-md">Save</button>
<button class="btn btn-c-danger btn-style-outline btn-s-md">Delete</button>
<button class="btn btn-c-success btn-style-subtle btn-s-md">Continue</button>
<button class="btn btn-c-neutral btn-style-ghost btn-s-md">Cancel</button>
<button class="btn btn-c-primary btn-style-solid btn-s-md" disabled>Loading...</button>
```

Each button uses the base class plus color, style, and size classes. The base defines shared focus and disabled styles; the compound rules provide hover colors.

## Generated class names

| Class | Purpose |
|---|---|
| `btn` | Shared layout, transitions, focus, and disabled styles |
| `btn-c-primary` / `-success` / `-danger` / `-warning` / `-neutral` | Focus-ring color and color condition for compounds |
| `btn-style-solid` / `-outline` / `-subtle` / `-ghost` | Shared style properties and style condition for compounds |
| `btn-s-sm` / `-md` / `-lg` | Size |

Compound selectors match when both the color and style classes are on the same element. They add no class names.

## Customizing

To change the recipe:

- Change a palette tone by editing the four compound rules for that color, such as replacing `bg-blue-600` with `bg-green-600`. Update its focus-ring shortcut too.
- Add a color by defining a shortcut such as `c.accent: 'focus-visible:ring-purple-500'` and one compound rule per style.
- Add a style by defining a shortcut such as `style.link` and one compound rule per color.

## When compound variants are the right shape

The required CSS depends on both color and style. A solid primary button uses a blue background, a solid danger button uses red, and an outline primary button uses a transparent background. Compound rules describe those combinations.

The color condition comes first in each compound's `when` clause. Using `btn-c-primary` emits the four style compounds for primary; unused colors emit no compound rules. Rules for that color ship together, and their selectors check which style class is present. Consider the resulting CSS size before expanding the matrix.

The [Icon button recipe](/recipes/icon-button) combines size and an icon-only flag to adjust padding.
