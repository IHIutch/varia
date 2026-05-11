# Modal

The first recipe built with `defineSlotComponent`. A modal is a multi-element widget where the parts are tightly coupled — a backdrop wrapping a container, with header / body / footer parts that only make sense inside the container. Expressing it as sibling `defineComponent` calls (the way Dropdown does) would force consumers to remember and combine four or five separate prefixed classes; expressing it as slots gives them a single namespace.

## Authoring

```ts
// recipes/modal.config.ts
import { defineSlotComponent } from 'varia'

export default defineSlotComponent('modal', {
  slots: {
    root: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4',
    container:
      'relative w-full rounded-lg bg-white shadow-xl ring-1 ring-gray-200 max-h-[90vh] overflow-hidden flex flex-col',
    header: 'flex items-start justify-between gap-4 p-4 border-b border-gray-200',
    title: 'text-lg font-semibold text-gray-900',
    description: 'mt-1 text-sm text-gray-600',
    body: 'p-4 overflow-y-auto flex-1',
    footer: 'flex items-center justify-end gap-2 p-4 border-t border-gray-200',
    close:
      'absolute top-3 right-3 inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  },
  variants: {
    size: {
      sm: { container: 'max-w-sm' },
      md: { container: 'max-w-md' },
      lg: { container: 'max-w-lg' },
      xl: { container: 'max-w-2xl' },
    },
  },
})
```

Two things worth pointing out:

1. The `root` slot maps to the bare component class (`modal`); every other slot maps to `modal__slotName` using BEM. The double underscore makes slot classes visually distinct from variant classes (which use single dashes).
2. The `size` variant uses the **slot-keyed** shape — each size value targets the `container` slot only. This means `modal-size-md` doesn't change the backdrop or header; it only sets the max-width of the inner box. Slot-keyed variants emit as descendant-selector CSS rules (`.modal-size-md .modal__container { max-width: ... }`) so they apply through the markup tree without consumers having to remember to add a class to the container element.

## Live preview

:::raw
<div class="my-6">
  <p class="mb-3 text-sm text-gray-700">A modal rendered statically (open, inline, contained inside the docs page rather than full-viewport) so you can see all the slots at once:</p>
  <div class="relative border border-gray-200 rounded-md overflow-hidden" style="height: 360px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0);">
    <div class="modal modal-size-md" style="position: absolute;" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
      <div class="modal__container">
        <div class="modal__header">
          <div>
            <h2 class="modal__title" id="demo-modal-title">Confirm deletion</h2>
            <p class="modal__description">This action can't be undone.</p>
          </div>
          <button class="modal__close" type="button" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal__body">
          <p class="text-sm text-gray-700">Deleting this project will permanently remove all of its files, history, and shared links. Type the project name to confirm.</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn-c-neutral btn-style-outline btn-s-sm" type="button">Cancel</button>
          <button class="btn btn-c-danger btn-style-solid btn-s-sm" type="button">Delete project</button>
        </div>
      </div>
    </div>
  </div>
</div>
:::

## Size variants in action

The interesting property of `size` being a **slot-keyed** variant is that swapping it changes *only* the container's max-width. The backdrop, header, body padding, and footer don't react at all. Here are the same modal contents rendered at four sizes so you can see what changes (container width) and what doesn't (everything else):

:::raw
<div class="my-6 space-y-4">
  <p class="text-sm text-gray-700">Each preview below renders the same DOM with a different <code>modal-size-*</code> class on the root. The container slot resizes; the backdrop, the header padding, and the close-button position all stay identical.</p>

  <div class="text-xs font-mono text-gray-500 pl-1"><code>modal-size-sm</code></div>
  <div class="relative border border-gray-200 rounded-md overflow-hidden" style="height: 240px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0);">
    <div class="modal modal-size-sm" style="position: absolute;" role="dialog" aria-modal="true" aria-labelledby="demo-sm-title">
      <div class="modal__container">
        <div class="modal__header">
          <div>
            <h2 class="modal__title" id="demo-sm-title">Save changes?</h2>
          </div>
          <button class="modal__close" type="button" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal__body">
          <p class="text-sm text-gray-700">You have unsaved edits.</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn-c-neutral btn-style-outline btn-s-sm" type="button">Discard</button>
          <button class="btn btn-c-primary btn-style-solid btn-s-sm" type="button">Save</button>
        </div>
      </div>
    </div>
  </div>

  <div class="text-xs font-mono text-gray-500 pl-1"><code>modal-size-md</code></div>
  <div class="relative border border-gray-200 rounded-md overflow-hidden" style="height: 240px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0);">
    <div class="modal modal-size-md" style="position: absolute;" role="dialog" aria-modal="true" aria-labelledby="demo-md-title">
      <div class="modal__container">
        <div class="modal__header">
          <div>
            <h2 class="modal__title" id="demo-md-title">Save changes?</h2>
          </div>
          <button class="modal__close" type="button" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal__body">
          <p class="text-sm text-gray-700">You have unsaved edits.</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn-c-neutral btn-style-outline btn-s-sm" type="button">Discard</button>
          <button class="btn btn-c-primary btn-style-solid btn-s-sm" type="button">Save</button>
        </div>
      </div>
    </div>
  </div>

  <div class="text-xs font-mono text-gray-500 pl-1"><code>modal-size-lg</code></div>
  <div class="relative border border-gray-200 rounded-md overflow-hidden" style="height: 240px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0);">
    <div class="modal modal-size-lg" style="position: absolute;" role="dialog" aria-modal="true" aria-labelledby="demo-lg-title">
      <div class="modal__container">
        <div class="modal__header">
          <div>
            <h2 class="modal__title" id="demo-lg-title">Save changes?</h2>
          </div>
          <button class="modal__close" type="button" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal__body">
          <p class="text-sm text-gray-700">You have unsaved edits.</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn-c-neutral btn-style-outline btn-s-sm" type="button">Discard</button>
          <button class="btn btn-c-primary btn-style-solid btn-s-sm" type="button">Save</button>
        </div>
      </div>
    </div>
  </div>

  <div class="text-xs font-mono text-gray-500 pl-1"><code>modal-size-xl</code></div>
  <div class="relative border border-gray-200 rounded-md overflow-hidden" style="height: 240px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0);">
    <div class="modal modal-size-xl" style="position: absolute;" role="dialog" aria-modal="true" aria-labelledby="demo-xl-title">
      <div class="modal__container">
        <div class="modal__header">
          <div>
            <h2 class="modal__title" id="demo-xl-title">Save changes?</h2>
          </div>
          <button class="modal__close" type="button" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal__body">
          <p class="text-sm text-gray-700">You have unsaved edits.</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn-c-neutral btn-style-outline btn-s-sm" type="button">Discard</button>
          <button class="btn btn-c-primary btn-style-solid btn-s-sm" type="button">Save</button>
        </div>
      </div>
    </div>
  </div>
</div>
:::

The CSS rule each variant emits, for reference:

```css
.modal-size-sm .modal__container { max-width: var(--container-sm); }
.modal-size-md .modal__container { max-width: var(--container-md); }
.modal-size-lg .modal__container { max-width: var(--container-lg); }
.modal-size-xl .modal__container { max-width: var(--container-2xl); }
```

The variant class lives on the root, but the styling lands on the container via the descendant-selector. No class change is needed on `modal__container` itself — `varia` writes the descendant rule into a preflight at preset construction.

## Consumption

```html
<div class="modal modal-size-md" role="dialog" aria-modal="true" aria-labelledby="m-title">
  <div class="modal__container">
    <div class="modal__header">
      <div>
        <h2 class="modal__title" id="m-title">Confirm deletion</h2>
        <p class="modal__description">This action can't be undone.</p>
      </div>
      <button class="modal__close" type="button" aria-label="Close">×</button>
    </div>

    <div class="modal__body">
      …body content…
    </div>

    <div class="modal__footer">
      <button class="btn btn-c-neutral btn-style-outline btn-s-sm" type="button">Cancel</button>
      <button class="btn btn-c-danger btn-style-solid btn-s-sm" type="button">Delete</button>
    </div>
  </div>
</div>
```

## What's being demonstrated

- **Slots replace prefix-grouped sibling components.** One `defineSlotComponent('modal', ...)` call replaces what would otherwise be five or six `defineComponent` calls (`modal-backdrop`, `modal-container`, `modal-header`, …).
- **BEM class names.** The root slot is bare (`modal`); other slots get the double-underscore suffix (`modal__container`, `modal__header`). This format is `varia`-specific — variant classes use single dashes (`modal-size-md`), slot classes use double underscores, so the two never collide.
- **Slot-keyed variants apply through the tree.** Writing `<div class="modal modal-size-md">` automatically scopes a max-width onto the descendant `.modal__container`. The consumer doesn't have to add `modal__container-md` or pass a size class to the container directly.
- **No defaults.** Per ADR-0003, `varia` doesn't apply default variants. The container has no max-width unless a size class is present. Consumers always write the variant explicitly — `<div class="modal modal-size-md">`, never just `<div class="modal">` if they want a sized container.
- **Behavior is the consumer's problem.** `varia` doesn't ship open/close logic, focus trapping, or scroll locking. Pair these classes with your framework's dialog primitive (the native `<dialog>` element, Radix Dialog, Headless UI, etc).

## Generated class names

| Class | Slot |
|---|---|
| `modal` | The root — full-viewport backdrop with centering |
| `modal__container` | The dialog box |
| `modal__header` | Top bar (title row) |
| `modal__title` | Heading inside the header |
| `modal__description` | Optional subtitle under the title |
| `modal__body` | Scrollable middle section |
| `modal__footer` | Action row (right-aligned by default) |
| `modal__close` | Floating close button |
| `modal-size-sm` / `-md` / `-lg` / `-xl` | Container max-width |

Nine consumer-facing classes, one component, slot-keyed sizing.

## Why a `<dialog>`-shaped helper isn't part of `varia`

`varia` emits classes; it doesn't render DOM. The native `<dialog>` element handles focus trapping and the top-layer paint for free in modern browsers, but you opt into it from your framework. A typical pairing:

```html
<dialog class="modal modal-size-md" role="dialog">
  <div class="modal__container">…</div>
</dialog>
```

The `.modal`'s `position: fixed` and `inset: 0` give you the backdrop styling even outside the top layer, so the same classes work whether you reach for `<dialog>`, a portaled `<div>`, or your framework's dialog component.
