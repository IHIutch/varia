# Spinner

Size and color variants around Tailwind's `animate-spin`.

## Recipe

Copy this definition and change its import to `variacss`.

<<< ../../recipes/spinner.config.ts

## Live preview

:::raw
<div class="my-6 p-6 border border-gray-200 rounded-md bg-gray-50 flex flex-wrap items-center gap-6">
  <span class="spinner spinner-s-sm spinner-c-primary"></span>
  <span class="spinner spinner-s-md spinner-c-primary"></span>
  <span class="spinner spinner-s-lg spinner-c-primary"></span>
  <span class="spinner spinner-s-md spinner-c-muted"></span>
  <span class="spinner spinner-s-md spinner-c-danger"></span>
  <button class="btn btn-c-primary btn-style-solid btn-s-md" disabled>
    <span class="spinner spinner-s-sm" style="color: currentColor"></span>
    Saving...
  </button>
</div>
:::

## Usage

```html
<div role="status" aria-label="Loading">
  <span class="spinner spinner-s-md spinner-c-primary"></span>
</div>
```

The border inherits `currentColor`. Omit the color variant to inherit a parent color. Tailwind supplies the animation keyframes.
