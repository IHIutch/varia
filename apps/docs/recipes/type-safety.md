# Editor support

Install [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss). It reads the Tailwind CSS entrypoint and its `@plugin` registration. Varia classes autocomplete directly in `class`/`className` attributes, with CSS hover previews and native responsive/prefix syntax. No typed joiner or generated declaration setup is needed.

Enable suggestions inside strings and existing class helpers in VS Code settings:

```json
{
  "editor.quickSuggestions": { "strings": "on" },
  "tailwindCSS.classFunctions": ["clsx"]
}
```

Automatic discovery works in the tested standalone and shared-source monorepo consumers. For ambiguous projects, [map the CSS entrypoint to its consumers](https://github.com/tailwindlabs/tailwindcss-intellisense#tailwindcssexperimentalconfigfile):

```json
{
  "tailwindCSS.experimental.configFile": {
    "apps/web/src/styles.css": "apps/web/**"
  }
}
```

### Refreshing imported definitions

IntelliSense 0.16.0 watches the file named by `@plugin` but does not track that file's transitive JavaScript/TypeScript imports. Editing an imported recipe alone leaves suggestions stale. Until that native limitation is fixed, extend the [development reload config](/tailwind#development-reload) to update the stylesheet timestamp on a development config reload:

```ts
import { utimesSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import './tailwind.config.js'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    const now = new Date()
    utimesSync(fileURLToPath(new URL('./src/styles.css', import.meta.url)), now, now)
  }
  return {
    plugins: [tailwindcss()],
    server: { warmup: { clientFiles: ['./src/styles.css'] } },
  }
})
```

Keep Vite running for automatic refresh. Its existing config dependency tracking covers imported recipes and local shared helpers; IntelliSense sees the stylesheet event and reloads. The stylesheet content stays unchanged and production builds do not touch it. Add/remove recipes in the registration configuration as usual. Without Vite running, save the CSS entrypoint after recipe edits to refresh IntelliSense.

For missing suggestions, run **Tailwind CSS: Show Output** and check that the extension loaded the intended stylesheet and local Tailwind version. Check errors from the `@plugin` module, ignored files, and entrypoint mappings. Fix an invalid configuration and save it again. For errors inside imported definitions, also inspect Vite's terminal; fixing them restores the config restart and editor refresh. An initially invalid Vite configuration requires fixing it and starting Vite again.

Native lint rules cover conflicts, invalid `@apply`, and other Tailwind diagnostics. They do not generally report unknown class strings in markup. Autocomplete and CSS hover recognition are verified here; unknown-class linting is a separate optional integration.
