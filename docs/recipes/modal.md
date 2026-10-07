# Modal

Use slots to style the backdrop and the elements inside the modal.

## Recipe

Put the size variant on the root to set the container's maximum width:

<<< ../../recipes/modal.config.ts

`modal-size-md` on the root generates `.modal-size-md .modal__container`. Choose a size explicitly; Varia applies no default variants.

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

## Usage

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

Your application controls opening, closing, focus, and scroll locking. The root styles create a fixed backdrop with a flex layout. Adapt them to your dialog implementation before using them on a native `<dialog>` element.

The footer uses the [button recipe](/recipes/button). Register that definition too if you use the markup above.
