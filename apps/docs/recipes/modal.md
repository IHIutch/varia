# Modal

A modal with named slots for its backdrop, container, header, body, and footer. All parts share the `modal` class prefix.

## Authoring

```ts
// recipes/modal.config.ts
import { defineComponent } from 'varia'

export default defineComponent('modal', {
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

Slots determine where the size styles apply:

1. The root uses `modal`. Other slots use names such as `modal__container`. Double underscores separate slots; dashes separate variants.
2. The size variant targets the container through a descendant selector, such as `.modal-size-md .modal__container { max-width: ... }`. Put the size class on the root; the container needs only its slot class.

## Live preview

:::raw
<div class="my-6">
  <p class="mb-3 text-sm text-gray-700">This static preview contains the modal inside the page so you can see all its parts:</p>
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

Changing size affects the container's max-width. The backdrop, header padding, and close-button position stay the same. These previews show the smallest and largest sizes:

:::raw
<div class="my-6 space-y-4">
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

Each size emits a descendant rule:

```css
.modal-size-sm .modal__container { max-width: var(--container-sm); }
.modal-size-md .modal__container { max-width: var(--container-md); }
.modal-size-lg .modal__container { max-width: var(--container-lg); }
.modal-size-xl .modal__container { max-width: var(--container-2xl); }
```

The size class goes on the root. Varia emits a preflight rule that targets the descendant `modal__container`.

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
      ...body content...
    </div>

    <div class="modal__footer">
      <button class="btn btn-c-neutral btn-style-outline btn-s-sm" type="button">Cancel</button>
      <button class="btn btn-c-danger btn-style-solid btn-s-sm" type="button">Delete</button>
    </div>
  </div>
</div>
```

Your application provides open and close logic, focus management, and scroll locking. Pair the styles with a native `<dialog>` or a dialog component such as Radix Dialog or Headless UI. Add a size class explicitly; Varia applies no default variants.

## Generated class names

| Class | Slot |
|---|---|
| `modal` | Full-viewport backdrop that centers the container |
| `modal__container` | The dialog box |
| `modal__header` | Top bar (title row) |
| `modal__title` | Heading inside the header |
| `modal__description` | Optional subtitle under the title |
| `modal__body` | Scrollable middle section |
| `modal__footer` | Action row (right-aligned by default) |
| `modal__close` | Floating close button |
| `modal-size-sm` / `-md` / `-lg` / `-xl` | Container max-width |

The recipe generates eight slot classes and four size classes.

## Using a native `<dialog>`

Varia generates styles; your application renders the elements. A native `<dialog>` provides modal focus handling and top-layer rendering when opened with `showModal()`. Apply the container and slot classes to it:

```html
<dialog class="modal modal-size-md" role="dialog">
  <div class="modal__container">...</div>
</dialog>
```

The `modal` root uses `position: fixed` and `inset: 0` for its backdrop. You can use that wrapper with a `<div>` dialog or adapt the slots to your framework's dialog component.
