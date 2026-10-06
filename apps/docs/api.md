# API reference

`defineComponent` defines component styles and class names. `tailwindVaria` registers them with Tailwind. The `varia/types` subpath provides the generated class-name union for TypeScript.

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

When every key is a declared slot name, the variant targets those slots. Varia emits rules with descendant selectors for non-root slots and a variant selector for the root when the variant class is used. Mixing slot names and value names throws.

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

## `tailwindVaria(options)`

```ts
import { tailwindVaria } from 'varia/tailwind'

export default tailwindVaria({ components: [button, modal] })
```

Returns a Tailwind v4 JavaScript plugin. Register it with `@plugin` and import `varia/tailwind.css` before Tailwind. See the [quickstart](/quickstart).

### Options

```ts
interface TailwindVariaOptions {
  components: DefinedComponent[]
  manifest?: false | { path?: string }
  prefix?: string
}
```

| Field | Default | Description |
|---|---|---|
| `components` | required | Component definitions to register. Duplicate component or class names throw. |
| `manifest` | `{}` | Writes `node_modules/.varia/manifest.d.ts`. Pass `false` to disable or `{ path }` to choose another path. |
| `prefix` | unset | Configures a lowercase Tailwind prefix, or matches an existing CSS `prefix(tw)`. See [prefixes](/tailwind#options). |

### Manifest emission

The plugin writes a `VariaClasses` union when Tailwind loads it during compilation. Plugins sharing an output path combine their classes within that compilation. A new compilation replaces the previous union, removing stale classes. Plugins using different paths write separate manifests.

Varia recreates the file on the next build if it is deleted. Unchanged contents do not cause a write. The default path uses the existing `node_modules` gitignore entry.

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

### Typed completion

Import `varia/types` when writing typed `cn()` helpers, validators, or lint rules. Editors can complete values of the generated `VariaClasses` union. Template completion through Tailwind's editor extension has not been verified for the experimental adapter.

### pnpm caveat

Under pnpm's default symlinked layout, `varia/types` may need additional configuration. See [Troubleshooting](/troubleshooting#pnpm-types-subpath).

## How emission works

Tailwind generates registered component utilities for classes found in its configured sources or `@source inline()` entries. Unused activation classes produce no component rules or utility dependencies.

- A slot-keyed variant activates with its variant class. All descendant rules emit together, even if the slot classes are not scanned separately.
- A compound activates with the class for its first `when` condition. For `{ when: { s: 'xs', square: true } }`, `btn-s-xs` activates a selector that still requires `btn-square` on the same element.

Compound filtering is conservative. Rules sharing the same first condition ship together. Put the axis that should control emission first in `when`. Varia does not infer class co-occurrence or create a consumer-facing compound class.

A root variant uses a single class selector. A slot uses a descendant selector such as `.modal-size-md .modal__container`. A compound uses a combined selector such as `.btn-s-xs.btn-square`.

The stylesheet defines ordered `base`, `variants`, and `compounds` sublayers inside Tailwind's utilities layer. Compounds override variants, variants override bases, and ordinary Tailwind utilities override all Varia sublayers. This order does not require repeated selectors or important modifiers. Explicit important declarations follow CSS's reversed layer precedence.

Tailwind resolves `@apply` strings against its current theme and emits referenced variables, properties, and keyframes. Exclude definition files from source scanning to avoid emitting their literal atomic utility strings independently of the component classes.

## Validation errors

`defineComponent` validates authoring inputs immediately. `tailwindVaria` validates names when constructed and checks collisions across plugin registrations when Tailwind loads it.

### `defineComponent`

| Condition | Example | Error starts with |
|---|---|---|
| Invalid component name | `defineComponent('Btn', ...)` | `Invalid component name "Btn" — must match...` |
| Both `base` and `slots` set | `defineComponent('btn', { base, slots })` | `Component "btn" sets both \`base\` and \`slots\`...` |
| `slots: {}` (declared but empty) | `defineComponent('card', { slots: {} })` | `Component "card" has no slots — \`slots\` must declare at least one named part.` |
| Nothing to emit | `defineComponent('btn', {})` | `Component "btn" has no \`base\`/\`slots\` and no \`variants\`...` |
| Invalid slot name | `slots: { Header: '...' }` | `Invalid slot name "Header" on component "card" — slot names must match...` |
| Empty / whitespace expansion | `c: { primary: '   ' }` | `Empty expansion for "btn-c-primary"...` |
| Empty slot expansion | `accent: { header: '   ' }` | `Empty expansion for "card-accent"...` |
| Empty slot map | `tone: { solid: {} }` | `Variant "tone" value "solid" on component "card" has an empty slot map...` |
| Invalid slot expansion shape | `accent: { header: { header: 'block' } }` | `Variant "accent" on component "card" slot "header" must be a string or an array of strings.` |
| Variant with zero values | `c: {}` | `Variant "c" on component "btn" has no values...` |
| Mixed-key variant (some slot names, some not) | `variants: { v: { root: '...', primary: '...' } }` | `Variant "v" on component "card" has an invalid shape...` |
| Slot-keyed value references a non-existent slot | `variants: { v: { solid: { missing: '...' } } }` | `Variant "v" value "solid" on component "card" references slot "missing"...` |
| Assembled class fails regex | `c: { Primary: 'x' }` (uppercase) | `Invalid class identifier "btn-c-Primary"...` |
| Compound references undeclared axis | `compoundVariants: [{ when: { xyz: ... } }]` | `Compound variant on component "btn" references variant axis "xyz"...` |
| Compound sets multi-value axis to undeclared value | `when: { s: 'xl' }` (no `xl` value) | `Compound variant on component "btn" sets "s" to "xl", which is not a declared value.` |
| Compound sets boolean axis to non-`true` | `when: { square: 'false' }` | `Compound variant on component "btn" sets "square" to "false", but "square" is a boolean variant...` |
| Empty `when: {}` or empty `class: ''` | — | `Compound variant on component "btn" has an empty "when" clause` / `...has an empty "class"` |

### `tailwindVaria`

| Condition | Error starts with |
|---|---|
| Two components with the same name | `Duplicate component name "btn" in tailwindVaria...` |
| Two components emitting the same shortcut | `Duplicate shortcut "btn-c-primary" emitted by both component "btn" and component "btn-old"...` |
| Duplicate class names involving slot-keyed variants | `Duplicate class "card-accent" emitted by both component "card" and component "card-accent"...` |

Passing the same component reference twice also triggers the duplicate-name error.

## `DefinedComponent` return value

Pass the returned value to `tailwindVaria`. Tools can inspect class names, utility expansions, and relative selectors. Tailwind resolves the utility strings on demand. Slot and compound rules are stored in `styles`.

```ts
interface DefinedComponent {
  name: string
  shortcuts: Array<[className: string, expansion: string]>
  manifest: { name: string, classNames: string[] }
  styles?: Array<{
    trigger: string
    kind: 'slot' | 'compound'
    rules: Array<{ selector: string, utilities: string }>
  }>
}
```

Each `selector` is relative to the activation class, represented by `&`. A root slot override uses `&`; descendant slots use selectors such as `& .card__title`. See the [Tailwind guide](/tailwind) for cascade behavior and setup.
