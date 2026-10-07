# Your first component style

In this tutorial you will build a button, then add a size variant and see the button change. You will use Vite, Tailwind, and Varia in a standalone project.

You need Node.js 26 or newer and npm for this Vite 8 setup. The walkthrough was verified with Node.js 26.8.2.

## 1. Create a project

In your terminal, run:

```sh
mkdir varia-first-style
cd varia-first-style
```

Create `package.json` with this content:

```json
{
  "name": "varia-first-style",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Install the package and build tools:

```sh
npm install variacss
npm install -D vite@8.3.2 tailwindcss@4.3.3 @tailwindcss/vite@4.3.3
```

The build-tool versions match the repository's demo. The project will contain these files:

```text
varia-first-style/
  package.json
  vite.config.ts
  button.config.ts
  tailwind.config.ts
  styles.css
  index.html
```

## 2. Define the button

Create `button.config.ts`:

```ts
import { defineComponent } from 'variacss'

export default defineComponent('demo-btn', {
  base: 'inline-flex rounded bg-blue-600 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
})
```

The component name is `demo-btn`. That is the class you will use in HTML.

## 3. Connect the CSS build

Create `vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import './tailwind.config.js'

export default defineConfig({
  plugins: [tailwindcss()],
  server: { warmup: { clientFiles: ['./styles.css'] } },
})
```

Create `tailwind.config.ts`:

```ts
import { tailwindVaria } from 'variacss/tailwind'
import button from './button.config.js'

export default tailwindVaria({ components: [button] })
```

Create `styles.css`:

```css
@import "variacss/tailwind.css";
@import "tailwindcss" source(none);
@source "./index.html";
@plugin "./tailwind.config.ts";
```

Keep the imports in this order. The first stylesheet establishes the layers used by component styles. The plugin path is relative to `styles.css`.

## 4. See the first result

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>First Varia style</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body class="p-8">
    <button type="button" class="demo-btn">Save</button>
  </body>
</html>
```

Run:

```sh
npm run dev
```

Open the local URL printed by Vite. You should see a blue button with white text, rounded corners, and padding. Press Tab to focus the button and see its focus outline. The button has no save action; this example defines its styles.

If the button looks unstyled, check the stylesheet link, registration, and import order against the files above. [Troubleshooting](/troubleshooting) lists further checks.

## 5. Add a size variant

With the development server running, replace `button.config.ts` with:

```ts
import { defineComponent } from 'variacss'

export default defineComponent('demo-btn', {
  base: 'inline-flex rounded bg-blue-600 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
  variants: {
    size: {
      lg: 'px-6 py-3 text-lg',
    },
  },
})
```

Change the button in `index.html` to:

```html
<button type="button" class="demo-btn demo-btn-size-lg">Save</button>
```

Vite should restart and refresh the page after the definition changes. The button should have larger padding and text. Remove `demo-btn-size-lg` from the HTML to see the original size return.

Use the complete class name `demo-btn-size-lg` in your source. Tailwind needs to discover that name to generate its CSS. The registration import in `vite.config.ts` lets Vite track definitions and their local imports. See [development reload](/tailwind#development-reload) for the supported boundaries.

## 6. Build the project

Stop the development server and run:

```sh
npm run build
npm run preview
```

Open the preview URL. The built page should show the same button. You have defined a component style, registered it, loaded its CSS, and activated a variant through an HTML class.

To continue, [style child elements with slots](/guides/style-child-elements) or [change variants at a breakpoint](/guides/responsive-variants). Read [the styling model](/concepts) for the relationship between definitions, class names, and generated CSS.

For exact versioning and compatibility limits, see [compatibility](/reference/compatibility).
