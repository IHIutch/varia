# API reference

`defineComponent` defines component styles and class names. `presetVaria` registers them with UnoCSS. The `varia/types` subpath provides the generated class-name union for TypeScript.

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

Provide `base`, `slots`, or `variants`. A component can have base styles or slots without variants. See the [Card recipe](/recipes/card) for a base-only example.

### Single-element vs. multi-element

For a component that maps to one HTML element, use `base`:

```ts
defineComponent('btn', {
  base: 'inline-flex items-center ...',
  variants: { c: { primary: '...' } },
})
// Generates: btn, btn-c-primary
```

For a component with several parts, such as a modal or a card with a header and body, declare `slots`:

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

A `VariantDefinition` accepts the four forms below. For components with slots, object keys determine whether a variant targets slots or names values. You can use `string[]` wherever a class string is accepted; Varia joins the array with spaces.

#### Boolean variant (applied to root)

```ts
pill: 'rounded-full'
// Generates: badge-pill
```

A string or string array defines a boolean variant. Adding the class enables its styles; omitting it disables them. Use named values for explicit off-state styling or more than two states.

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

When every key is a declared slot name, the variant targets those slots. Varia emits preflight rules with descendant selectors for non-root slots and a variant selector for the root. Mixing slot names and value names throws.

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

A compound variant applies styles when the variant classes in its `when` clause are present on the same element. Varia emits a CSS selector that combines those classes. It adds no class name.

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

Write `<button class="btn btn-s-xs btn-square">`. The selector `.btn-s-xs.btn-square` matches when both variant classes are present.

| `when` value | Meaning |
|---|---|
| `'value'` | The matching multi-value axis is set to this value. The value must be declared in the variant. |
| `true` | The matching boolean axis is present. Boolean axes can only take `true` in a compound; the absence-of-class is the off state. |

Varia validates the assembled class name against `/^[a-z][a-z0-9-]*$/`. Values can start with numbers because the component prefix starts with a letter. For example, `s: { 1: 'x' }` produces `btn-s-1`, and `s: { '2xl': 'x' }` produces `btn-s-2xl`.

## `presetVaria(options)`

```ts
import { presetVaria } from 'varia/preset'
```

Returns a UnoCSS preset containing the registered shortcuts and preflights. Calling `presetVaria` also writes the TypeScript manifest unless `manifest` is `false`.

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

`presetVaria` writes a TypeScript declaration containing a `VariaClasses` union of all registered class names. The default path is `node_modules/.varia/manifest.d.ts`.

- Varia recreates the file on the next UnoCSS run if you delete `node_modules`.
- The file uses the existing `node_modules` gitignore entry.
- Varia compares the existing file contents and writes only when they change, avoiding unnecessary HMR rebuilds.

## `varia/types` subpath

```ts
import type { VariaClasses } from 'varia/types'
```

This subpath re-exports `VariaClasses` from the generated manifest. Import it to check class strings in TypeScript:

```ts
function cn(c: VariaClasses) { return c }

cn('btn-c-primary') // ok
cn('not-a-real-class') // type error
```

### Editor autocomplete is separate

The [UnoCSS VS Code extension](https://marketplace.visualstudio.com/items?itemName=antfu.unocss) reads shortcuts from `unocss.config.ts`. It offers completion in files matching its configured globs, including HTML, JSX, ERB, Liquid, and HEEx. Autocomplete requires no manifest import.

Import `varia/types` when writing typed `cn()` helpers, validators, or lint rules.

### pnpm caveat

Under pnpm's default symlinked layout, `varia/types` may need additional configuration. See [Troubleshooting](/troubleshooting#pnpm-types-subpath).

## How emission works

Varia emits compound and slot-keyed rules as UnoCSS preflights. Preflights bypass the source scan, so every registered rule ships even if templates never reference its classes.

- A non-root slot uses a descendant selector, such as `.modal-size-md .modal__container { ... }`.
- A root slot uses the variant selector, such as `.card-accent { ... }`. Put the variant class on the root element.
- A compound uses a combined selector, such as `.btn-s-xs.btn-square { ... }`.

Shortcut CSS is generated on demand. Compound and slot-keyed rules currently emit unconditionally; checking one class name alone would not establish whether a combination or descendant selector is used.

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

Passing the same component reference twice also triggers the duplicate-name error.

## `DefinedComponent` return value

Pass the returned value to `presetVaria`. Tools can read these fields to inspect shortcuts, class names, and preflights.

```ts
interface DefinedComponent {
  name: string
  shortcuts: Array<[className: string, expansion: string]>
  manifest: { name: string, classNames: string[] }
  preflights?: Preflight[] // present iff compoundVariants or slot-keyed variants were declared
}
```
