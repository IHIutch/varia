# Icon button

Size and square variants. Compounds replace labeled-button padding with equal padding for icon-only buttons.

## Recipe

<<< ../../recipes/icon-button.config.ts

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
