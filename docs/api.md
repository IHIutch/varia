# API reference

`varia` exposes four things: `defineComponent` and `defineSlotComponent` (authoring), `presetVaria` (UnoCSS integration), and `varia/types` (consumer-side type access).

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
  compoundVariants?: CompoundVariantRule[]
}

type VariantDefinition = string | Record<string, string>

type CompoundVariantRule = {
  when: Record<string, string | true>
  class: string
}
```

| Field | Type | Description |
|---|---|---|
| `base` | `string` (optional) | Utility classes applied whenever the bare component name is used. |
| `variants` | `Record<string, VariantDefinition>` (optional) | The component's variant axes. Keys are the axis names (`c`, `s`, `outline`); values are the variant definitions. |
| `compoundVariants` | `CompoundVariantRule[]` (optional) | Cross-axis rules. See [Compound variants](#compound-variants). |

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
pill: 'rounded-full'
// Generates: badge-pill
```

The detection rule: a variant is boolean iff its value is a string. The off state is the absence of the class. If you need explicit off-state styling (or three+ states from one axis), use a multi-value variant with named values like `state: { open: '...', closed: '...' }`.

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

Authors write `<button class="btn btn-s-xs btn-square">` — both variant classes side by side — and the compound rule's CSS applies automatically via the selector `.btn-s-xs.btn-square`.

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

Compound rules emit as UnoCSS preflights, which means they're unconditional — the CSS for every declared compound is present in the output regardless of whether the consumer's markup happens to reference that particular combination. This is intentional: it bypasses tree-shaking concerns for cross-axis rules, where the "is this rule used" question can't be answered by scanning for a single class name.

### Return value

```ts
type DefinedComponent = {
  name: string
  shortcuts: Array<[className: string, expansion: string]>
  manifest: { name: string; classNames: string[] }
  preflights?: Preflight[]   // present iff compoundVariants or slot-keyed variants were declared
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

## `defineSlotComponent(name, config)`

```ts
import { defineSlotComponent } from 'varia'

const modal = defineSlotComponent('modal', { /* config */ })
```

For multi-element components — a modal with backdrop / container / header / body / footer, a card with header / title / body, a dropdown menu where the parts share a namespace. Each named part is a **slot**, and variants can target slots independently.

If a component has only one element, use `defineComponent`. If a component has tightly coupled parts that share a namespace, reach for `defineSlotComponent`.

### Arguments

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes | Component name. Same validation rules as `defineComponent`. |
| `config` | `SlotComponentConfig` | yes | Slots and (optionally) variants. |

### `SlotComponentConfig`

```ts
type SlotComponentConfig = {
  slots: Record<string, string>
  variants?: Record<string, SlotVariantDefinition>
}

type SlotVariantDefinition =
  | string                                 // boolean → applies to root
  | Record<string, string>                 // multi-value (string per value, applied to root)
  | Record<string, Record<string, string>> // multi-value with slot-keyed values
  | Record<string, string>                 // boolean slot-keyed (keys must all be slot names)
```

| Field | Type | Description |
|---|---|---|
| `slots` | `Record<string, string>` | Named parts. Each key is a slot name; the value is the utility class string for that slot. At least one slot is required. |
| `variants` | `Record<string, SlotVariantDefinition>` (optional) | Variant axes. Each can apply to the root slot only (string-valued) or target specific slots (slot-keyed object). |

### Class-name shape

The `root` slot maps to the bare component name; every other slot maps to `component__slot` (BEM double-underscore). A slot name must match `/^[a-z][a-z0-9-]*$/`.

```ts
defineSlotComponent('modal', {
  slots: {
    root: '…',         // → .modal
    container: '…',    // → .modal__container
    header: '…',       // → .modal__header
  },
})
```

See [Naming convention](/naming#slots-vs-variants-the-two-separators) for why the BEM separator was chosen and how it interacts with variant naming.

### Variant shapes (slot components)

A slot component's variants have four valid shapes. The library disambiguates by inspecting keys against the component's declared slot names.

#### Boolean variant applied to root

```ts
variants: { elevated: 'shadow-lg' }
// Generates: card-elevated, applied to the root slot
```

#### Multi-value variant applied to root

```ts
variants: { tone: { brand: 'bg-blue-50', warning: 'bg-amber-50' } }
// Generates: card-tone-brand, card-tone-warning, both applied to root
```

#### Boolean slot-keyed variant

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

All keys must be slot names of this component. Mixing slot keys and value keys throws.

#### Multi-value slot-keyed variant

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

Each value can independently be a string (apply to root) or a slot-keyed object (apply to specific slots).

### How slot-keyed variants emit

Slot-keyed variants emit as UnoCSS preflights — CSS rules with descendant selectors like `.modal-size-md .modal__container { … }`. Because preflights aren't subject to UnoCSS's content scan, slot-keyed CSS survives even when the consumer's markup only references the variant class on the root and not the slot class on the descendant. This is the same tree-shaking-bypass mechanism that compound variants use.

The `root` slot is a special case: its variant rule uses a chained-class selector (`.card-accent` directly, not `.card-accent .card`) because the root class lives on the same element as the variant class.

### Validation errors (slot components)

`defineSlotComponent` throws synchronously on:

| Condition | Error message starts with |
|---|---|
| No slots declared | `Component "modal" has no slots — defineSlotComponent requires at least one slot.` |
| Slot name fails regex | `Invalid slot name "Container" on component "modal" — slot names must match …` |
| A variant object mixes slot-name keys with non-slot keys | `Variant "accent" on component "card" has an invalid shape. It must be either a string, an object whose keys are ALL slot names of this component, or…` |
| A slot-keyed value references a slot that doesn't exist | `Variant "size" value "sm" on component "modal" references slot "containr", which is not declared in the component's slots.` |
| Component name invalid, empty expansion, etc. | Same rules as `defineComponent`. |

### Return value

Same `DefinedComponent` shape as `defineComponent`. The `preflights` field is always populated when any slot-keyed variant is declared.

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
