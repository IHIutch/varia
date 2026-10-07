# Icon button

Size and square variants. Compounds replace labeled-button padding with equal padding for icon-only buttons. [Full definition](https://github.com/IHIutch/varia/blob/main/recipes/icon-button.config.ts).

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

## Usage

```html
<button class="icon-btn icon-btn-s-md" type="button">
  <svg aria-hidden="true">...</svg> Add
</button>
<button class="icon-btn icon-btn-s-md icon-btn-square" type="button" aria-label="Add">
  <svg aria-hidden="true">...</svg>
</button>
```

The size class emits a compound such as `.icon-btn-s-md.icon-btn-square`. Both classes must be on the button. Keeping square separate lets consumers specify size once.
