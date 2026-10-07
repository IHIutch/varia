# Form input

Use state and size variants to style inputs. The definition also styles focus, disabled inputs, and placeholder text.

## Recipe

<<< ../../recipes/form-input.config.ts

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 grid gap-3 w-full">
  <input class="form-input form-input-state-default form-input-s-md" placeholder="Default state" />
  <input class="form-input form-input-state-error form-input-s-md" placeholder="Error state" aria-invalid="true" />
  <input class="form-input form-input-state-success form-input-s-md" placeholder="Success state" />
  <input class="form-input form-input-state-default form-input-s-sm" placeholder="Small" />
  <input class="form-input form-input-state-default form-input-s-lg" placeholder="Large" />
  <input class="form-input form-input-state-default form-input-s-md form-input-readonly" readonly value="cannot edit" />
  <input class="form-input form-input-state-default form-input-s-md" placeholder="Disabled" disabled />
</div>
:::

## Usage

```html
<input class="form-input form-input-state-default form-input-s-md" />
<input class="form-input form-input-state-error form-input-s-md" aria-invalid="true" />
<input class="form-input form-input-state-default form-input-s-md form-input-readonly"
       readonly value="cannot edit" />
```

The `state` variant controls appearance. Your application handles validation. Use both `form-input-readonly` and the `readonly` attribute to apply the read-only background and cursor styles.
