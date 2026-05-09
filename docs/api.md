# API reference

`varia` exposes three things: `defineComponent` (authoring), `presetVaria` (UnoCSS integration), and `varia/types` (consumer-side type access).

## `defineComponent(name, config)`

```ts
import { defineComponent } from 'varia'

const button = defineComponent('btn', { /* config */ })
```

### Arguments

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes | Component name. Used as the prefix on every generated class. Must match `/^[a-z][a-z0-9-]*$/`. |
| `config` | `ComponentConfig` | yes | The component's variant configuration. |

### `ComponentConfig`

```ts
type ComponentConfig = {
  base?: string
  variants?: Record<string, VariantDefinition>
}

type VariantDefinition = string | Record<string, string>
```

| Field | Type | Description |
|---|---|---|
| `base` | `string` (optional) | Utility classes applied whenever the bare component name is used. |
| `variants` | `Record<string, VariantDefinition>` (optional) | The component's variant axes. Keys are the axis names (`c`, `s`, `outline`); values are the variant definitions. |

At least one of `base` or `variants` must be present. A component with neither would emit nothing useful.

### Variant shapes

`varia` supports two shapes inside a `VariantDefinition`. The shape is detected at runtime from `typeof`.

#### Multi-value variant

```ts
c: { primary: 'bg-blue-600', danger: 'bg-red-600' }
// Generates: btn-c-primary, btn-c-danger
```

Use named values that describe what's varying: `primary`, `sm`, `open`, `closed`.

#### Boolean variant

```ts
outline: 'bg-transparent border-2'
// Generates: btn-outline
```

The detection rule: a variant is boolean iff its value is a string. The off state is the absence of the class. If you need explicit off-state styling (or three+ states from one axis), use a multi-value variant with named values like `state: { open: '...', closed: '...' }`.

### Return value

```ts
type DefinedComponent = {
  name: string
  shortcuts: Array<[className: string, expansion: string]>
  manifest: { name: string; classNames: string[] }
}
```

You typically don't read these fields directly. Pass the value to `presetVaria`. They're documented because the manifest is also useful for tooling: every generated class name appears in `manifest.classNames`.

### Validation errors

`defineComponent` throws synchronously on:

| Condition | Example | Error message starts with |
|---|---|---|
| Invalid component name | `defineComponent('Btn', …)` | `Invalid component name "Btn" — must match…` |
| Empty `base` AND no `variants` | `defineComponent('btn', {})` | `Component "btn" has no \`base\` and no \`variants\`…` |
| Empty / whitespace expansion | `c: { primary: '   ' }` | `Empty expansion for "btn-c-primary"…` |
| Variant with zero values | `c: {}` | `Variant "c" on component "btn" has no values…` |
| Assembled class fails regex | `c: { Primary: 'x' }` (uppercase) | `Invalid class identifier "btn-c-Primary"…` |

The regex `/^[a-z][a-z0-9-]*$/` is applied to the assembled class name, not to individual segments. Numeric values (`s: { 1: 'x' }` produces `btn-s-1`) and arbitrary kebab values (`s: { '2xl': 'x' }` produces `btn-s-2xl`) work naturally.

## `presetVaria(options)`

```ts
import { presetVaria } from 'varia/preset'
```

Returns a UnoCSS preset that flattens components into shortcuts and emits a TypeScript declaration manifest as a side-effect.

### Options

```ts
type PresetVariaOptions = {
  components: DefinedComponent[]
  manifest?: false | { path?: string }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `components` | `DefinedComponent[]` | required | The components to register with UnoCSS. Order is preserved in the resulting shortcut list. |
| `manifest` | `false \| { path?: string }` | `{ path: 'node_modules/.varia/manifest.d.ts' }` | Controls manifest emission. Pass `false` to disable. Pass `{ path }` to override the default path. |

### Manifest emission

When the preset resolves, `presetVaria` writes a TypeScript declaration file containing a `VariaClasses` union of every valid class name across all registered components. The default path is `node_modules/.varia/manifest.d.ts`, a Prisma-style location that:

- Survives `rm -rf node_modules` (regenerates on next UnoCSS run).
- Doesn't require any consumer-side gitignore entry.
- Is rewritten only when content changes (hash-compare), so HMR rebuilds don't churn the file.

### Validation errors

`presetVaria` throws synchronously on:

| Condition | Error message |
|---|---|
| Two components with the same name | `Duplicate component name "btn" in presetVaria…` |
| Two components emitting the same shortcut name | `Duplicate shortcut "btn-c-primary" emitted by both component "btn" and component "btn-old"…` |

The duplicate-component-name check always throws, even when the same reference is passed twice. This is a deliberate choice for safety in monorepos with multiple module instances.

## `varia/types` subpath

```ts
import type { VariaClasses } from 'varia/types'
```

A re-export shim that surfaces the `VariaClasses` union from the manifest. Use it for type-strict tooling on the consumer side:

```ts
function cn(c: VariaClasses) { return c }

cn('btn-c-primary')        // ok
cn('not-a-real-class')     // type error
```

### Editor autocomplete is separate

The primary editor-completion path is the UnoCSS VS Code extension ([antfu.unocss](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)), not the manifest. The extension reads shortcuts directly from `unocss.config.ts` and offers completion in any file matching its glob: HTML, JSX, ERB, Liquid, HEEx, etc. You don't need to import anything for autocomplete.

The `varia/types` subpath is for explicit-import use cases: typed `cn()` helpers, custom validators, lint rules.

### pnpm caveat

Under pnpm's default symlinked layout, `varia/types` may fail to resolve because the relative path inside the stub climbs through the real (non-symlinked) directory tree. Workarounds:

- Set `compilerOptions.preserveSymlinks: true` in your `tsconfig.json`.
- Or set `node-linker=hoisted` in your `.npmrc`.

Tracked as a v1.1 follow-up.
