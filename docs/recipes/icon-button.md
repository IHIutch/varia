# Icon button

The canonical compound-variants recipe. An icon button has two axes that interact: **size** (xs/sm/md/lg) and **square** (icon-only). Each axis means something on its own, but the combination needs a different value than either provides — that's the cross-axis dependency `compoundVariants` is built to express.

## The problem compound variants solve

A button with a label wants asymmetric padding — wider horizontally than vertically — so the text has breathing room and the shape reads as a button. `s-md` gives you `px-3.5 py-2`.

A button with *only* an icon wants equal padding all around — otherwise the icon sits in a rectangle that's twice as wide as it is tall and looks lopsided.

The size and the square-ness can't be derived from each other. `square` alone can't know what padding to apply (it depends on the size). `s-md` alone can't know whether the consumer is rendering an icon or a label (it depends on the use). Both axes have to be set together to pick the right padding. That's a compound rule.

## Authoring

```ts
// recipes/icon-button.config.ts
import { defineComponent } from 'varia'

export default defineComponent('icon-btn', {
  base: [
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium border',
    'bg-white border-gray-300 text-gray-700',
    'hover:bg-gray-50',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
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

Each compound rule says: "when these axes are set together on the same element, apply this class." The compound emits a CSS rule with a chained-class selector (`.icon-btn-s-md.icon-btn-square`), not a new consumer-facing class — the consumer keeps writing the same individual variant classes side by side.

## Live preview

<div class="my-6 space-y-6 vp-raw">
<p class="text-sm text-gray-700">Each row shows the same size variant rendered with a label (asymmetric padding from the size variant alone) and with just an icon (equal padding from the size × square compound). The icon-only variant sits in a true square; the labeled variant reads as a button shape.</p>
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
  <svg>…icon…</svg>
  Add
</button>

<!-- Icon-only button: size + square together -->
<button class="icon-btn icon-btn-s-md icon-btn-square" type="button" aria-label="Add">
  <svg>…icon…</svg>
</button>
```

The consumer writes `icon-btn-s-md` and `icon-btn-square` as two side-by-side classes. UnoCSS resolves each individually via shortcuts; varia's preflight emits the compound CSS rule `.icon-btn-s-md.icon-btn-square { padding: ... }` that overrides the asymmetric size padding when both classes appear on the same element.

## The CSS varia emits

For the rule above, the generated output includes:

```css
.icon-btn-s-md     { padding-inline: ...; padding-block: ...; font-size: ... }
.icon-btn-square   { aspect-ratio: 1 / 1; }
.icon-btn-s-md.icon-btn-square { padding: ... }   /* compound — overrides */
```

Three rules in increasing specificity. The browser's cascade does the rest. There's no `icon-btn-s-md-square` class to remember.

## Why not just write a `square-md` value?

You could collapse the matrix by making `square` a multi-value variant: `square: { xs, sm, md, lg }`. That would replace the four compounds with four direct shortcuts. Two reasons not to:

1. **`square` and `size` mean different things.** The size variant controls font size and (for labeled buttons) padding. The square flag controls aspect ratio. Squishing them into one axis loses that meaning at the consumer site.
2. **Consumers would have to write *both* the size and the square value redundantly.** `<button class="icon-btn icon-btn-s-md icon-btn-square-md">` reads worse than `<button class="icon-btn icon-btn-s-md icon-btn-square">`. The compound shape pushes the matrix into the config where it belongs and keeps the markup short.

The general rule of thumb: use a compound when two axes are conceptually independent but have CSS that needs them combined. Use a single multi-value variant when the axes are really one concept.

## Generated class names

| Class | Purpose |
|---|---|
| `icon-btn` | Base styling |
| `icon-btn-s-xs` / `-sm` / `-md` / `-lg` | Size (font + padding for labeled buttons) |
| `icon-btn-square` | Force a square aspect ratio (icon-only) |

Six consumer-facing classes, four compound CSS rules (no extra class for each).

## When you'd reach for this pattern

- A button's icon-only mode needs different padding than its labeled mode.
- A card's `compact` variant needs different gap behavior at each size.
- A tag's `dismissible` variant needs different right-padding to leave room for the close button.
- Any "feature flag" boolean that interacts with a sizing axis.

When the axes don't interact (color × size for a Button, where color picks the palette and size picks the dimensions independently), you don't need compounds — see the [Button recipe](/recipes/button) for the per-component-vars pattern that handles independent axes cleanly.
