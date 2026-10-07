# Icon button

An icon button with size and square variants. Labeled buttons use more horizontal than vertical padding. Icon-only buttons use equal padding. Compound rules choose the padding for each size when the square variant is present.

## Authoring

```ts
// recipes/icon-button.config.ts
import { defineComponent } from 'variacss'

export default defineComponent('icon-btn', {
  base: [
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium border',
    'bg-white border-gray-300 text-gray-700',
    'hover:bg-gray-50',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  variants: {
    s: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3.5 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    },
    square: 'aspect-square',
  },
  compoundVariants: [
    { when: { s: 'xs', square: true }, class: 'p-1' },
    { when: { s: 'sm', square: true }, class: 'p-1.5' },
    { when: { s: 'md', square: true }, class: 'p-2' },
    { when: { s: 'lg', square: true }, class: 'p-2.5' },
  ],
})
```

Each compound emits a combined selector such as `.icon-btn-s-md.icon-btn-square`. It applies the padding when both classes are present on the same element, without adding a class name.

## Live preview

<div class="my-6 space-y-6 vp-raw">
<p class="text-sm text-gray-700">Each row compares a labeled button with an icon-only button at the same size. The compound rule gives the icon-only button equal padding on all sides.</p>
<div class="grid grid-cols-2 gap-x-8 gap-y-3 items-center">
<div class="text-xs font-mono text-gray-500"><code>icon-btn icon-btn-s-xs</code></div>
<div class="text-xs font-mono text-gray-500"><code>icon-btn icon-btn-s-xs icon-btn-square</code></div>
<button class="icon-btn icon-btn-s-xs" type="button" style="justify-self: start;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg> Add</button>
<button class="icon-btn icon-btn-s-xs icon-btn-square" type="button" aria-label="Add" style="justify-self: start;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg></button>
<div class="text-xs font-mono text-gray-500"><code>icon-btn icon-btn-s-sm</code></div>
<div class="text-xs font-mono text-gray-500"><code>icon-btn icon-btn-s-sm icon-btn-square</code></div>
<button class="icon-btn icon-btn-s-sm" type="button" style="justify-self: start;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg> Add</button>
<button class="icon-btn icon-btn-s-sm icon-btn-square" type="button" aria-label="Add" style="justify-self: start;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg></button>
<div class="text-xs font-mono text-gray-500"><code>icon-btn icon-btn-s-md</code></div>
<div class="text-xs font-mono text-gray-500"><code>icon-btn icon-btn-s-md icon-btn-square</code></div>
<button class="icon-btn icon-btn-s-md" type="button" style="justify-self: start;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg> Add</button>
<button class="icon-btn icon-btn-s-md icon-btn-square" type="button" aria-label="Add" style="justify-self: start;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg></button>
<div class="text-xs font-mono text-gray-500"><code>icon-btn icon-btn-s-lg</code></div>
<div class="text-xs font-mono text-gray-500"><code>icon-btn icon-btn-s-lg icon-btn-square</code></div>
<button class="icon-btn icon-btn-s-lg" type="button" style="justify-self: start;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg> Add</button>
<button class="icon-btn icon-btn-s-lg icon-btn-square" type="button" aria-label="Add" style="justify-self: start;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg></button>
</div>
</div>

## Consumption

```html
<!-- Labeled button: size variant alone -->
<button class="icon-btn icon-btn-s-md" type="button">
  <svg>...icon...</svg>
  Add
</button>

<!-- Icon-only button: size + square together -->
<button class="icon-btn icon-btn-s-md icon-btn-square" type="button" aria-label="Add">
  <svg>...icon...</svg>
</button>
```

Write `icon-btn-s-md icon-btn-square` on the button. Tailwind generates each shortcut, and the size class activates a combined rule that overrides padding when `icon-btn-square` is also present. Unused sizes emit no compound rules.

## The CSS varia emits

For the rule above, the generated output includes:

```css
.icon-btn-s-md     { padding-inline: ...; padding-block: ...; font-size: ... }
.icon-btn-square   { aspect-ratio: 1 / 1; }
.icon-btn-s-md.icon-btn-square { padding: ... }   /* compound — overrides */
```

Compound rules are in `varia.compounds`, which follows the base and variant layers. Native utilities still override normal compound declarations.

## Why this isn't a multi-value `square` variant

You could define `square: { xs, sm, md, lg }` and replace the compounds with direct shortcuts. Keeping the axes separate has two benefits:

1. Size controls font size and labeled-button padding. Square controls aspect ratio. Separate axes let consumers choose them independently.
2. Consumers specify the size once. `icon-btn-s-md icon-btn-square` avoids repeating `md` in a second class such as `icon-btn-square-md`.

Use compounds when separate choices affect the same CSS property. Use one multi-value variant when the choices represent a single setting.

## Generated class names

| Class | Purpose |
|---|---|
| `icon-btn` | Base styling |
| `icon-btn-s-xs` / `-sm` / `-md` / `-lg` | Size (font + padding for labeled buttons) |
| `icon-btn-square` | Force a square aspect ratio (icon-only) |

The recipe generates six class names and four compound rules.

## When to use this pattern

- A button's icon-only mode needs different padding than its labeled mode.
- A card's `compact` variant needs different gap behavior at each size.
- A tag's `dismissible` variant needs different right-padding to leave room for the close button.
- A boolean variant changes styles differently at each size.

Independent axes need no compounds. Color and size can each define their own styles. The [Button recipe](/recipes/button) uses compounds for color and style because those choices interact.
