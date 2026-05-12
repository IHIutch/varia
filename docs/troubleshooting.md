# Troubleshooting

Known gotchas.

## pnpm: `varia/types` subpath {#pnpm-types-subpath}

If `import type { VariaClasses } from 'varia/types'` fails to resolve under pnpm, pick one of the workarounds below. The stub uses a relative path that climbs through pnpm's real (non-symlinked) directory tree.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "preserveSymlinks": true
  }
}
```

```ini
# .npmrc
node-linker=hoisted
```

The UnoCSS VS Code extension works without any of this; autocomplete reads the shortcut list directly from `unocss.config.ts`. The caveat only matters if you import `VariaClasses` for a `cn()` helper or a custom lint rule. See the [Type safety recipe](/recipes/type-safety) for those use cases.

## Identifier conflicts at preset construction {#identifier-conflicts}

`presetVaria` throws synchronously if two components emit the same class name. The check fires at preset construction time, before UnoCSS scans any markup, so you'll see the error on first build.

A common collision is a multi-axis component plus a separately-defined component whose name happens to look like one of the first component's assembled classes:

```ts
import { defineComponent } from 'varia'
import { presetVaria } from 'varia/preset'

const btn = defineComponent('btn', {
  variants: { c: { primary: 'bg-blue-600' } }, // emits btn-c-primary
})

const btnCPrimary = defineComponent('btn-c-primary', {
  base: 'rounded-md', // emits btn-c-primary
})

presetVaria({ components: [btn, btnCPrimary] })
// throws: Duplicate shortcut "btn-c-primary" emitted by both
//         component "btn" and component "btn-c-primary"
```

The fix is renaming. Either shortcut would surprise some consumer, so neither wins. Rename the conflicting component to something the button can't generate: `primary-btn`, `cta`, `submit-button`.

A related pitfall is naming a component after a UnoCSS utility (`flex`, `grid`, `hidden`). The shortcut wins or loses depending on preset order. Avoid utility-shaped names.
