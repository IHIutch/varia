# V1 public contract

This is the contract for the Tailwind implementation of Varia. It takes precedence over the historical engine comparison in [COMPARISON.md](COMPARISON.md). Applications supply markup, interaction behavior, and accessibility.

## Supported exports

| Import | Supported interface |
| --- | --- |
| `varia` | `defineComponent` and the authoring types listed below |
| `varia/tailwind` | `tailwindVaria` and `TailwindVariaOptions` |
| `varia/types` | Type-only `VariaClasses`; `VariaClassRegistry` is reserved for generated augmentation |
| `varia/tailwind.css` | Stylesheet establishing cascade order |

The root authoring types are `ClassInput`, `ComponentConfig`, `CompoundVariantRule`, `CompoundVariantWhen`, `DefinedComponent`, `SlotKeyedValue`, `VariantDefinition`, and `VariantValue`. `DefinedComponent` is factory output for registration. Pass it unchanged to `tailwindVaria`; do not construct, mutate, serialize, or extend its generated structure. Its `shortcuts`, `styles`, and `manifest` members are implementation details. Their layout and generated CSS formatting can change without a major release. The type requires factory output; `Shortcut`, `ComponentStyle`, and `ComponentManifest` are private types.

`varia/adapter` and its `createAdapter` alias belonged to the pre-release comparison and are removed before v1. Use the named Tailwind integration. Source files, `dist` paths, manifest-writing functions, and test helpers are not public imports. There is no styling runtime or JavaScript value export from `varia/types`.

## Define and register styles

```ts
import { defineComponent } from 'varia'
import { tailwindVaria } from 'varia/tailwind'

const card = defineComponent('card', {
  slots: {
    root: 'block rounded p-4',
    title: 'font-semibold',
    body: ['p-2', 'text-sm'],
  },
  variants: {
    busy: 'opacity-50',
    accent: { root: 'ring-2', title: 'text-blue-600' },
    size: { sm: 'p-2', lg: 'p-6' },
    tone: { info: { title: 'text-blue-600' }, danger: 'text-red-600' },
  },
  compoundVariants: [
    { when: { size: 'lg', busy: true }, class: 'p-8' },
  ],
})

export default tailwindVaria({ components: [card] })
```

Load that configuration with Tailwind's native plugin loader. Import the layer stylesheet before Tailwind:

```css
@import "varia/tailwind.css";
@import "tailwindcss";
@plugin "./tailwind.config.ts";
```

```html
<article class="card card-size-lg card-accent">
  <h2 class="card__title">Title</h2>
  <div class="card__body">Body</div>
</article>
```

`ClassInput` accepts a nonempty utility string or an array of strings joined with spaces. Varia delegates expansion to Tailwind's native `@apply`. Theme variables, custom utilities, arbitrary values/selectors, and individual modifiers such as `hover:` and `md:` retain Tailwind behavior. Variant groups such as `hover:(bg-blue-600 text-white)` are rejected. Write `hover:bg-blue-600 hover:text-white`. Literal punctuation inside arbitrary-value brackets is allowed.

At least one base/slot or variant is required. `base` is shorthand for `slots: { root: base }`; setting both is an error. Explicit `slots: {}` is an error. Variants without a base, and slots without a `root`, are supported. Those definitions do not register a bare component class unless a root/base is declared. Empty expansions, empty maps for a variant axis, and empty slot maps within values are errors.

## Class names and variants

| Definition | Class |
| --- | --- |
| `base` or `slots.root` | `card` |
| `slots.title` | `card__title` |
| Boolean `busy` | `card-busy` |
| Multi-value `size.lg` | `card-size-lg` |

Component names and slot names match `/^[a-z][a-z0-9-]*$/`. Assembled variant class identifiers must also match that pattern. Variant keys and values must therefore produce valid identifiers. `__` is reserved for generated slot classes. Names and generated classes must be unique across registrations in one resolved Tailwind configuration. Choose names that avoid native Tailwind utilities; detecting utility collisions is the developer's responsibility.

Variant definitions have these supported shapes:

- A string or array is a boolean variant applied to the activation element.
- An object whose keys all name declared slots is a boolean slot variant.
- An object whose keys all differ from declared slots is a multi-value variant. Each value may be a string, array, or slot-keyed object.
- A multi-value slot map may target any nonempty subset of declared slots.

An object mixing slot names with value names is ambiguous and rejected. Slot names are reserved as top-level value names within variant definitions. With a declared `root`, `variants: { tone: { root: 'ring-2' } }` is boolean `card-tone`, not multi-value `card-tone-root`. Use a different value name such as `default` for a multi-value axis. Unknown slots inside a multi-value slot map are errors.

Boolean activation has no generated false class and no default value. Omitting its class leaves it inactive. Varia does not select or merge values for an axis. Applying multiple values leaves the conflict to CSS; class attribute order does not select a winner.

## On-demand activation and slots

Tailwind must discover literal class names in its configured sources, or receive them through its native source configuration. Dynamic construction such as `'card-size-' + size` is outside source scanning support. Registering definitions or generating types does not eagerly emit CSS.

Each scanned base, slot, or flat variant class emits its own expansion. A slot-keyed variant emits all of its slot rules when its activation class is scanned, even if the base and descendant slot classes were not scanned. It does not automatically include their base expansions.

Root styles match the activation element without requiring the bare component class. Other slot styles use descendant selectors such as `.card-accent .card__title`. Slots need not be direct children, but must be descendants. A `card__title` on the activation element itself does not match.

There is no nearest-component ownership or nested-instance isolation. An outer `card-accent` styles every matching `card__title` below it, including titles inside a nested `card`. Different component names have different slot classes. Use distinct definition names or explicit application CSS when nested instances must be independent. A nested root does not stop the outer selector.

Slot matching requires the literal bare slot class, or its configured prefix form. A descendant with only `md:card__title` does not match `.card__title`; include `card__title` when slot variants should target it. Responsive slot base classes remain available independently.

States inside a slot expansion act on the styled slot. A usage-site modifier acts on the activation element. Thus `hover:card-accent` with a title expansion `focus:opacity-75` requires hover on the activation element and focus on the title for that declaration.

## Compounds and responsive conditions

`compoundVariants` apply utilities to the activation element when all `when` conditions match there. They create no additional class. Conditions reference declared axes: boolean axes accept only `true`; multi-value axes accept one declared string value. False conditions, arrays of values, unknown axes/values, and an empty `when` are rejected. Compound `class` accepts a nonempty `ClassInput`, not a slot map.

The first `when` entry, in JavaScript property iteration order, activates CSS generation. Remaining entries become exact class conditions. For `{ when: { size: 'lg', busy: true }, class: 'p-8' }`, scanning `card-size-lg` emits `.card-size-lg.card-busy`, even when `card-busy` was not scanned. Scanning only `card-busy` does not emit the compound.

Tailwind can modify the first condition class. Remaining conditions must retain their bare spelling, including the configured prefix. Varia does not infer effective values at a viewport size or combine independently modified conditions.

| Classes for the compound above | Compound behavior |
| --- | --- |
| `card-size-lg card-busy` | Applies whenever both classes are present |
| `md:card-size-lg card-busy` | Applies at `md` and above |
| `hover:card-size-lg card-busy` | Applies while the activation element is hovered |
| `card-size-lg md:card-busy` | Does not match unless bare `card-busy` is also present |
| `md:card-size-lg md:card-busy` | Does not match, even above `md` |
| `md:card-size-lg lg:card-busy` | Does not combine the breakpoint conditions |

If `busy` must be modified, put it first in `when` and keep `card-size-lg` bare. That order is semantically significant. For independently responsive axes, express responsive rules in the expansion or author explicit CSS. Individual variant CSS still works for modified classes in every row above.

## Cascade and prefixes

For normal declarations, precedence is base/slot, then variants, then compounds, then native atomic utilities. The layer stylesheet establishes `utilities.varia.base`, `utilities.varia.variants`, and `utilities.varia.compounds`; native utilities in the parent `utilities` layer outrank its sublayers. A native utility on a slot can override a slot variant despite its descendant selector specificity.

Utility string order does not override Tailwind's native ordering. For example, `px-2 p-4` retains 16px vertical padding and 8px horizontal padding with the default theme. Responsive utilities use Tailwind's resolved breakpoint ordering. Varia does not promise a winner for competing rules within one layer or several active values of an axis. Use explicit conditions/selectors or utilities to resolve conflicts. CSS importance reverses layer priority for important declarations; the normal precedence promise does not apply to `!important` conflicts. Tailwind's component important modifier, such as `card!`, is supported by CSS generation.

`tailwindVaria` accepts `prefix` containing lowercase ASCII letters. It sets the Tailwind plugin config prefix and expands unprefixed recipe utilities with that prefix. Markup uses `tw:card`, `tw:card__title`, and `tw:md:card-size-lg`. For a CSS-configured prefix, repeat the same value in `tailwindVaria({ prefix: 'tw', components })`; the public plugin interface does not expose the CSS prefix. A JavaScript Tailwind config prefix can be read by the plugin. Mismatched prefix settings are unsupported. Slot and compound conditions use the same effective prefix.

Native user CSS can `@apply` registered component classes; reference stylesheets also work through Tailwind's loader. Such application uses Tailwind's CSS semantics and does not expand the strict type grammar.

## Strict class types

```ts
import type { VariaClasses } from 'varia/types'

export function cn(...classes: VariaClasses[]): string {
  return classes.join(' ')
}

cn('card', 'md:card-size-lg')
```

`VariaClasses` contains registered base, slot, and activation names, plus exactly one responsive modifier from Tailwind's resolved breakpoint names. With a prefix it includes `tw:card` and `tw:md:card-size-lg`. It excludes native utilities, states, important modifiers, arbitrary variants, stacked modifiers, space-separated class strings, unknown breakpoints, and unknown/removed names. This bounded union is narrower than Tailwind's CSS grammar. The helper only joins strings; it does not merge classes or check whether compounds match in the DOM.

Keep manifest generation enabled, run the Tailwind build before typechecking, and include the declaration in the consuming project:

```json
{
  "files": ["node_modules/.varia/manifest.d.ts"],
  "include": ["src/**/*.ts"]
}
```

The generated file augments `varia/types`, so normal pnpm symlink resolution needs no hoisting or `preserveSymlinks`. Without augmentation `VariaClasses` is `never`. A missing file in `files` also produces a TypeScript missing-file error. Generate and include it before checking the helper.

`manifest: false` disables writing. `manifest: { path }` changes the destination; relative paths resolve against process cwd, not the config directory. Default output is `node_modules/.varia/manifest.d.ts` under process cwd. Include custom destinations explicitly in `files`. Registrations targeting the same destination within one resolved configuration aggregate classes. A newly resolved configuration replaces stale declarations there.

Include one aggregate manifest per TypeScript project. Independent configurations must have separate destinations and TypeScript projects; concurrent writers to one file are unsupported. Development reload uses the Vite configuration below. A complete generation lifecycle is tracked separately in issue [#3](https://github.com/IHIutch/varia/issues/3).

## Vite development reload

Use `@tailwindcss/vite` and import the same recipe registration configuration used by CSS in `vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import './tailwind.config.js'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    warmup: { clientFiles: ['./src/styles.css'] },
  },
})
```

Keep the stylesheet's `@plugin` directive. The additional config import makes recipes and their transitive local imports dependencies of Vite's configuration. Vite restarts when those dependencies change, including after invalid definitions are fixed. This avoids a Tailwind 4.3.3 recovery failure observed with CSS HMR alone. No Varia watcher or Vite plugin is required.

[Vite's CSS warmup](https://vite.dev/config/server-options#server-warmup) generates the class declarations on startup and after a configuration restart, before a browser requests CSS. Warmup paths resolve from Vite's root. Manifest destinations still follow the cwd rules above; use an absolute `manifest.path` when launching from another directory. Invalid recipes report the original error, and declarations can remain stale until compilation succeeds.

The supported boundary is static local imports reachable from the configuration, including shared monorepo sources outside the app root. Add/remove definitions in `tailwindVaria({ components })` as well as on disk. Directory discovery, runtime-computed imports, and editing installed packages under `node_modules` are outside this guarantee. Use Vite's default bundled configuration loader and keep file watching enabled.

`pnpm test:reload` packs Varia into standalone and monorepo consumers and checks imported helper edits, added/removed classes, invalid-definition recovery, computed CSS, and generated typings. Verified versions are Vite 8.0.11 and Tailwind/@tailwindcss/vite 4.3.3. Broader compatibility belongs to issue #4.

## Compatibility and versioning

V1 minor and patch releases preserve the documented authoring shapes, class spelling, activation rules, bounded type grammar, and normal layer precedence. Breaking contract changes require a major release. Supported exports can be deprecated in a minor release with a documented replacement and retained behavior until the next major release. Implementation structures, generated formatting, and exact error text are not compatibility promises. Invalid definitions and unknown utilities in active expansions must continue to fail; unused expansions need not be resolved by Tailwind.

The current package is ESM, declares Node.js 22 or newer, and has a Tailwind 4 peer range starting at 4.3.3. These are configuration bounds, not evidence that every combination has passed. Minimum TypeScript and integration versions, the release compatibility matrix, and cross-browser claims must follow issue [#4](https://github.com/IHIutch/varia/issues/4). Current browser checks use Chromium on macOS with a fixture reset. They do not establish complete browser support or production theme/reset coverage; issue [#5](https://github.com/IHIutch/varia/issues/5) covers that work.

Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm example:build`, `pnpm test:visual`, `pnpm test:reload`, and `pnpm comparison:reload`. The last command verifies native Vite recipe reload in the example. Comparison-only branch parity checks are historical and are not a v1 release gate.
