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
type VariantValue = ClassInput | SlotKeyedValue
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
  base: 'inline-flex items-center ...',
  variants: { c: { primary: '...' } },
})
// Generates: btn, btn-c-primary
```

For a component with several tightly coupled parts (modal, card with header / title / body, dropdown menu), declare `slots`:

```ts
defineComponent('modal', {
  slots: {
    root: '...', // emits .modal
    container: '...', // emits .modal__container
    header: '...', // emits .modal__header
  },
  variants: { /* see slot-keyed variant shapes below */ },
})
```

The `root` slot maps to the bare component name (`.modal`); every other slot maps to `component__slot` (BEM). See [Naming convention](/naming#slots-vs-variants-the-two-separators) for why the BEM separator was chosen and how it interacts with variant naming.

### Variant shapes

A `VariantDefinition` has four valid shapes, distinguished by value type and (for slot components) whether object keys match the declared slot names. Anywhere a class string appears, you can pass `string[]` and it will be joined with a space.

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
// Emits: .card-accent .card__header { ... }, .card-accent .card__title { ... }
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
// Emits: .modal-size-sm .modal__container { max-width: ... }, etc.
```

Each value can independently be a `ClassInput` (apply to root) or a slot-keyed object (apply to specific slots).

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

Under pnpm's default symlinked layout, `varia/types` may fail to resolve without a small bit of configuration. See the [pnpm note in Troubleshooting](/troubleshooting#pnpm-types-subpath).

## How emission works

Compound variants and slot-keyed variants both emit as **UnoCSS preflights** rather than shortcuts. Preflights bypass the content scan, so the CSS ships regardless of whether the consumer's markup references the variant class.

- Slot-keyed variant on a non-root slot: `.modal-size-md .modal__container { ... }` (descendant selector).
- Slot-keyed variant on `root`: `.card-accent { ... }` (chained-class selector — variant class and root class are on the same element).
- Compound variant: `.btn-s-xs.btn-square { ... }` (chained-class selector across axes).

The trade-off is that every declared compound or slot-keyed rule ships, used or not. This is intentional: a "is this combination used?" check can't be done by scanning for a single class name.

## Validation errors

`defineComponent` and `presetVaria` both throw synchronously on misuse, before any markup is scanned.

### `defineComponent`

| Condition | Example | Error starts with |
|---|---|---|
| Invalid component name | `defineComponent('Btn', ...)` | `Invalid component name "Btn" — must match...` |
| Both `base` and `slots` set | `defineComponent('btn', { base, slots })` | `Component "btn" sets both \`base\` and \`slots\`...` |
| `slots: {}` (declared but empty) | `defineComponent('card', { slots: {} })` | `Component "card" has no slots — \`slots\` must declare at least one named part.` |
| Nothing to emit | `defineComponent('btn', {})` | `Component "btn" has no \`base\`/\`slots\` and no \`variants\`...` |
| Invalid slot name | `slots: { Header: '...' }` | `Invalid slot name "Header" on component "card" — slot names must match...` |
| Empty / whitespace expansion | `c: { primary: '   ' }` | `Empty expansion for "btn-c-primary"...` |
| Variant with zero values | `c: {}` | `Variant "c" on component "btn" has no values...` |
| Mixed-key variant (some slot names, some not) | `variants: { v: { root: '...', primary: '...' } }` | `Variant "v" on component "card" has an invalid shape...` |
| Slot-keyed value references a non-existent slot | `variants: { v: { solid: { missing: '...' } } }` | `Variant "v" value "solid" on component "card" references slot "missing"...` |
| Assembled class fails regex | `c: { Primary: 'x' }` (uppercase) | `Invalid class identifier "btn-c-Primary"...` |
| Compound references undeclared axis | `compoundVariants: [{ when: { xyz: ... } }]` | `Compound variant on component "btn" references variant axis "xyz"...` |
| Compound sets multi-value axis to undeclared value | `when: { s: 'xl' }` (no `xl` value) | `Compound variant on component "btn" sets "s" to "xl", which is not a declared value.` |
| Compound sets boolean axis to non-`true` | `when: { square: 'false' }` | `Compound variant on component "btn" sets "square" to "false", but "square" is a boolean variant...` |
| Empty `when: {}` or empty `class: ''` | — | `Compound variant on component "btn" has an empty "when" clause` / `...has an empty "class"` |

### `presetVaria`

| Condition | Error starts with |
|---|---|
| Two components with the same name | `Duplicate component name "btn" in presetVaria...` |
| Two components emitting the same shortcut | `Duplicate shortcut "btn-c-primary" emitted by both component "btn" and component "btn-old"...` |

The duplicate-component-name check fires even when the same reference is passed twice — a deliberate choice for safety in monorepos with multiple module instances.

## `DefinedComponent` return value

You typically don't read these fields directly; pass the value to `presetVaria`. They're documented for tooling that wants to introspect the manifest.

```ts
interface DefinedComponent {
  name: string
  shortcuts: Array<[className: string, expansion: string]>
  manifest: { name: string, classNames: string[] }
  preflights?: Preflight[] // present iff compoundVariants or slot-keyed variants were declared
}
```
