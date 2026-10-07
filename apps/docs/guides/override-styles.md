# Override component styles and configure a prefix

Start with [a working integration](/tailwind). Use a native utility for a one-off style change; use a prefix when your project needs a namespace for Tailwind and Varia classes.

## Override a component with a utility

For a component whose base includes `px-4`, use:

```html
<button type="button" class="app-btn app-btn-tone-primary px-8">Save</button>
```

For normal declarations, `px-8` overrides the component's horizontal padding. Native Tailwind utilities outrank Varia's base, variant, and compound sublayers. Keep `variacss/tailwind.css` imported before `tailwindcss`.

Use one value per variant axis unless you have explicitly designed the competing rules. Moving classes around in the HTML does not select a winner. The normal layer precedence does not apply to important declaration conflicts. See [cascade rules](/tailwind#slots-and-compounds).

## Reuse a component class in authored CSS

In the CSS entry that loads Varia, you can apply a registered class:

```css
.checkout-action {
  @apply app-btn;
}
```

Use `checkout-action app-btn-tone-primary` in markup to keep the tone selectable. This uses Tailwind's native `@apply` behavior. It does not add `checkout-action` to the generated Varia class union.

## Configure a prefix

Set the same prefix in your CSS and plugin configuration. For example:

```css
@import "variacss/tailwind.css";
@import "tailwindcss" prefix(tw);
@plugin "./varia.config.ts";
```

```ts
import { tailwindVaria } from 'variacss/tailwind'
import button from './button.config.js'

export default tailwindVaria({ prefix: 'tw', components: [button] })
```

Keep the definition's utilities unprefixed. Update markup to use the configured prefix:

```html
<button type="button" class="tw:app-btn tw:app-btn-tone-primary tw:px-8">Save</button>
```

A responsive class uses `tw:md:app-btn-tone-primary`. The prefix comes before the modifier. Prefixes contain lowercase ASCII letters only. CSS-configured prefixes must also be supplied to `tailwindVaria`; mismatched values are unsupported.

Rebuild before checking the new class names. See [integration options](/tailwind#options) and [prefix semantics](/tailwind#slots-and-compounds).
