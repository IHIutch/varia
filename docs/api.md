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
interface ComponentConfig {
  base?: ClassInput
  slots?: Record<string, ClassInput>
  variants?: Record<string, VariantDefinition>
  compoundVariants?: CompoundVariantRule[]
}

type ClassInput = string | string[]

type SlotKeyedValue = Record<string, ClassInput>
type VariantValue  = ClassInput | SlotKeyedValue
type VariantDefinition = ClassInput | Record<string, VariantValue>

interface CompoundVariantRule {
  when: Record<string, string | true>
  class: ClassInput
}
```

| Field | Type | Description |
|---|---|---|
| `base` | `ClassInput` (optional) | Sugar for `slots: { root: base }`. Use this for single-element components. Mutually exclusive with `slots`. |
| `slots` | `Record<string, ClassInput>` (optional) | Named parts of a multi-element component. The `root` slot maps to the bare component name; every other slot maps to BEM `component__slot`. Slot names must match `/^[a-z][a-z0-9-]*$/`. |
| `variants` | `Record<string, VariantDefinition>` (optional) | The component's variant axes. Keys are the axis names (`c`, `s`, `outline`); values are the variant definitions. |
| `compoundVariants` | `CompoundVariantRule[]` (optional) | Cross-axis rules. See [Compound variants](#compound-variants). |

At least one of `base`/`slots` or `variants` must be present. A `base`-only component is the simplest valid shape; see the [Card recipe](/recipes/card) for that minimum form. `slots`-with-no-variants is also valid: a multi-element component with no variant axes.

### Single-element vs. multi-element

For a component that maps to one HTML element, use `base`:

```ts
defineComponent('btn', {
  base: 'inline-flex items-center …',
  variants: { c: { primary: '…' } },
})
// Generates: btn, btn-c-primary
```

For a component with several tightly coupled parts (modal, card with header / title / body, dropdown menu), declare `slots`:

```ts
defineComponent('modal', {
  slots: {
    root:      '…', // → .modal
    container: '…', // → .modal__container
    header:    '…', // → .modal__header
  },
  variants: { /* see slot-keyed variant shapes below */ },
})
```

The `root` slot maps to the bare component name (`.modal`); every other slot maps to `component__slot` (BEM). See [Naming convention](/naming#slots-vs-variants-the-two-separators) for why the BEM separator was chosen and how it interacts with variant naming.

### Variant shapes

A `VariantDefinition` has up to four valid shapes. The shape is detected at config time by inspecting the value's type and (for object values) by checking whether the keys match the component's declared slot names. Anywhere a class string appears, you can pass `string[]` and it will be joined with a space.

#### Boolean variant (applied to root)

```ts
pill: 'rounded-full'
// Generates: badge-pill
```

A string or string-array value is a boolean variant — the class is either present or absent. The off state is the absence of the class. For explicit off-state styling (or three+ states), use a multi-value variant.

#### Multi-value variant (applied to root)

```ts
c: { primary: 'bg-blue-600', danger: 'bg-red-600' }
// Generates: btn-c-primary, btn-c-danger
```

Use named values that describe what's varying: `primary`, `sm`, `open`, `closed`.

#### Boolean slot-keyed variant (slot components only)

```ts
variants: {
  accent: {
    header: 'bg-blue-600 text-white',
    title:  'text-white',
  },
}
// Generates: card-accent
// Emits: .card-accent .card__header { … }, .card-accent .card__title { … }
```

When all keys of the object are declared slot names, the variant targets specific slots. Each slot's CSS is emitted as a preflight with a descendant selector. Mixing slot-name keys and value-name keys throws.

#### Multi-value slot-keyed variant (slot components only)

```ts
variants: {
  size: {
    sm: { container: 'max-w-sm' },
    md: { container: 'max-w-md' },
    lg: { container: 'max-w-lg' },
  },
}
// Generates: modal-size-sm, modal-size-md, modal-size-lg
// Emits: .modal-size-sm .modal__container { max-width: … }, etc.
```

Each value can independently be a `ClassInput` (apply to root) or a slot-keyed object (apply to specific slots).

### How slot-keyed variants emit

Slot-keyed variants emit as UnoCSS preflights: CSS rules with descendant selectors like `.modal-size-md .modal__container { … }`. Because preflights aren't subject to UnoCSS's content scan, slot-keyed CSS survives even when the consumer's markup only references the variant class on the root and not the slot class on the descendant. This is the same tree-shaking-bypass mechanism that compound variants use.

The `root` slot is a special case: its variant rule uses a chained-class selector (`.card-accent` directly, not `.card-accent .card`) because the root class lives on the same element as the variant class.

### Compound variants

A compound variant defines CSS that applies only when *multiple* variant axes are set together. It does NOT produce a new consumer-facing class. Instead, `varia` emits a CSS rule with a chained-class selector built from the `when` conditions.

```ts
defineComponent('btn', {
  base: 'inline-flex',
  variants: {
    s: { xs: 'px-2 py-1 text-xs', sm: 'px-2.5 py-1.5 text-sm' },
    square: 'aspect-square',
  },
  compoundVariants: [
    { when: { s: 'xs', square: true }, class: 'p-1' },
    { when: { s: 'sm', square: true }, class: 'p-1.5' },
  ],
})
```

Authors write `<button class="btn btn-s-xs btn-square">`, with both variant classes side by side, and the compound rule's CSS applies automatically via the selector `.btn-s-xs.btn-square`.

| `when` value | Meaning |
|---|---|
| `'value'` | The matching multi-value axis is set to this value. The value must be declared in the variant. |
| `true` | The matching boolean axis is present. Boolean axes can only take `true` in a compound; the absence-of-class is the off state. |

Compound variants are validated against the declared axis registry:

| Condition | Error |
|---|---|
| `when` references an undeclared axis | `Compound variant on component "btn" references variant axis "xyz", which is not declared.` |
| `when` sets a multi-value axis to an undeclared value | `Compound variant on component "btn" sets "s" to "xl", which is not a declared value.` |
| `when` sets a boolean axis to a non-`true` value | `Compound variant on component "btn" sets "square" to "false", but "square" is a boolean variant — its value in a compound must be \`true\`.` |
| Empty `when: {}` or empty `class: ''` | `Compound variant on component "btn" has an empty "when" clause` / `…has an empty "class"` |

Compound rules emit as UnoCSS preflights, which means they're unconditional: the CSS for every declared compound is present in the output regardless of whether the consumer's markup happens to reference that particular combination. This is intentional. It bypasses tree-shaking concerns for cross-axis rules, where the "is this rule used" question can't be answered by scanning for a single class name.

### Return value

```ts
interface DefinedComponent {
  name: string
  shortcuts: Array<[className: string, expansion: string]>
  manifest: { name: string, classNames: string[] }
  preflights?: Preflight[] // present iff compoundVariants or slot-keyed variants were declared
}
```

You typically don't read these fields directly. Pass the value to `presetVaria`. They're documented because the manifest is also useful for tooling: every generated class name appears in `manifest.classNames`.

### Validation errors

`defineComponent` throws synchronously on:

| Condition | Example | Error message starts with |
|---|---|---|
| Invalid component name | `defineComponent('Btn', …)` | `Invalid component name "Btn" — must match…` |
| Both `base` and `slots` set | `defineComponent('btn', { base, slots })` | `Component "btn" sets both \`base\` and \`slots\`…` |
| `slots: {}` (declared but empty) | `defineComponent('card', { slots: {} })` | `Component "card" has no slots — \`slots\` must declare at least one named part.` |
| Nothing to emit | `defineComponent('btn', {})` | `Component "btn" has no \`base\`/\`slots\` and no \`variants\`…` |
| Invalid slot name | `slots: { Header: '…' }` | `Invalid slot name "Header" on component "card" — slot names must match…` |
| Empty / whitespace expansion | `c: { primary: '   ' }` | `Empty expansion for "btn-c-primary"…` |
| Variant with zero values | `c: {}` | `Variant "c" on component "btn" has no values…` |
| Mixed-key variant (some slot names, some not) | `variants: { v: { root: '…', primary: '…' } }` | `Variant "v" on component "card" has an invalid shape. It must be either a string/array, an object whose keys are ALL slot names of this component, or…` |
| Slot-keyed value references a non-existent slot | `variants: { v: { solid: { root: '…', missing: '…' } } }` | `Variant "v" value "solid" on component "card" references slot "missing", which is not declared in the component's slots.` |
| Assembled class fails regex | `c: { Primary: 'x' }` (uppercase) | `Invalid class identifier "btn-c-Primary"…` |

The regex `/^[a-z][a-z0-9-]*$/` is applied to the assembled class name, not to individual segments. Numeric values (`s: { 1: 'x' }` produces `btn-s-1`) and arbitrary kebab values (`s: { '2xl': 'x' }` produces `btn-s-2xl`) work naturally.

## `presetVaria(options)`

```ts
import { presetVaria } from 'varia/preset'
```

Returns a UnoCSS preset that flattens components into shortcuts and emits a TypeScript declaration manifest as a side-effect.

### Options

```ts
interface PresetVariaOptions {
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

cn('btn-c-primary') // ok
cn('not-a-real-class') // type error
```

### Editor autocomplete is separate

The primary editor-completion path is the UnoCSS VS Code extension ([antfu.unocss](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)), not the manifest. The extension reads shortcuts directly from `unocss.config.ts` and offers completion in any file matching its glob: HTML, JSX, ERB, Liquid, HEEx, etc. You don't need to import anything for autocomplete.

The `varia/types` subpath is for explicit-import use cases: typed `cn()` helpers, custom validators, lint rules.

### pnpm caveat

Under pnpm's default symlinked layout, `varia/types` may fail to resolve without a small bit of configuration. See [Troubleshooting → pnpm: `varia/types` subpath](/troubleshooting#pnpm-types-subpath).
