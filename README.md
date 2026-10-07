# varia

Define component styles with Tailwind utilities and use ordinary classes in any template. Tailwind generates the CSS on demand; Varia adds no styling runtime.

```ts
import { defineComponent } from 'variacss'

export default defineComponent('btn', {
  base: 'inline-flex items-center rounded px-4 py-2 font-medium',
  variants: {
    tone: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    size: { lg: 'px-6 py-3 text-lg' },
  },
})
```

```html
<button class="btn btn-tone-primary btn-size-lg">Save</button>
```

## Setup

In a Tailwind CSS v4 project:

```sh
npm install variacss tailwindcss
```

Register definitions with `tailwindVaria` from `variacss/tailwind` and import `variacss/tailwind.css` before Tailwind. Follow [Quickstart](https://github.com/IHIutch/varia/blob/main/apps/docs/quickstart.md) for the configuration.

Varia supports slots for child elements and compounds for combinations of variants. Your application supplies markup, interaction, and accessibility.

- [Guides](https://github.com/IHIutch/varia/tree/main/apps/docs/guides)
- [Recipes](https://github.com/IHIutch/varia/tree/main/recipes)
- [Contributing](https://github.com/IHIutch/varia/blob/main/CONTRIBUTING.md)
