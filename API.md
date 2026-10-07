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

## Editor support

Install [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss). It reads the Tailwind CSS entrypoint and its `@plugin` registration. Varia classes autocomplete directly in `class`/`className` attributes, with CSS hover previews and native responsive/prefix syntax. No typed joiner or generated declaration setup is needed; `manifest: false` works.

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

IntelliSense 0.16.0 watches the file named by `@plugin` but does not track that file's transitive JavaScript/TypeScript imports. Editing an imported recipe alone leaves suggestions stale. Until that native limitation is fixed, extend the [Vite development reload config](#vite-development-reload) to update the stylesheet timestamp on a development config reload:

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

A one-time integration check against Tailwind CSS IntelliSense/language server 0.16.0 verified Varia completions, hover, imported-definition refresh, HTML, JSX, and `clsx` with Tailwind 4.3.3 and Vite 8.0.11 on macOS. The language-server harness is not a maintained test suite: autocomplete belongs to Tailwind. After changing editor configuration, manually check a registered Varia class, edit its recipe with Vite running, and confirm its hover/suggestions refresh.

## Strict class types

`varia/types` remains optional tooling for consumers who want TypeScript to validate a bounded Varia vocabulary. It is independent of native editor autocomplete:

```ts
import type { VariaClasses } from 'varia/types'

const classes = ['card', 'md:card-size-lg'] satisfies VariaClasses[]
```

`VariaClasses` contains registered base, slot, and activation names, plus exactly one responsive modifier from Tailwind's resolved breakpoint names. With a prefix it includes `tw:card` and `tw:md:card-size-lg`. It excludes native utilities, states, important modifiers, arbitrary variants, stacked modifiers, space-separated class strings, unknown breakpoints, and unknown/removed names. This bounded union is narrower than Tailwind's CSS grammar. It does not merge classes or check whether compounds match in the DOM.

Keep manifest generation enabled, run the Tailwind build before typechecking, and include the declaration in the consuming project:

```json
{
  "files": ["node_modules/.varia/manifest.d.ts"],
  "include": ["src/**/*.ts"]
}
```

The generated file augments `varia/types`, so normal pnpm symlink resolution needs no hoisting or `preserveSymlinks`. Without augmentation `VariaClasses` is `never`. A missing file in `files` also produces a TypeScript missing-file error. Generate and include it before checking the helper.

`manifest: false` disables writing. `manifest: { path }` changes the destination; relative paths resolve against process cwd, not the config directory. Default output is `node_modules/.varia/manifest.d.ts` under process cwd. Include custom destinations explicitly in `files`. Registrations targeting the same destination within one resolved configuration aggregate classes. A newly resolved configuration replaces stale declarations there.

Include one aggregate manifest per TypeScript project. Independent configurations must have separate destinations and TypeScript projects; concurrent writers to one file are unsupported. Development reload uses the Vite configuration below. Generated declarations remain optional tooling; editor autocomplete does not depend on them.

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

Keep the stylesheet's `@plugin` directive. The additional config import makes recipes and their transitive local imports dependencies of Vite's configuration. In a running development session, Vite restarts when those dependencies change and recovers after invalid edits are fixed. This avoids a Tailwind 4.3.3 recovery failure observed with CSS HMR alone. No Varia watcher or Vite plugin is required.

[Vite's CSS warmup](https://vite.dev/config/server-options#server-warmup) generates the class declarations on startup and after a configuration restart, before a browser requests CSS. Warmup paths resolve from Vite's root. Manifest destinations still follow the cwd rules above; use an absolute `manifest.path` when launching from another directory. Invalid recipes report the original error, and declarations can remain stale until compilation succeeds. An invalid recipe at initial startup prevents Vite from starting; fix it and run Vite again.

The supported boundary is static local imports reachable from the configuration, including shared monorepo sources outside the app root. Add/remove definitions in `tailwindVaria({ components })` as well as on disk. Directory discovery, runtime-computed imports, and editing installed packages under `node_modules` are outside this guarantee. Use Vite's default bundled configuration loader and keep file watching enabled.

`pnpm test:reload` remains an optional integration check for imported helper edits, added/removed classes, invalid-definition recovery, computed CSS, and generated typings. It uses a packed Varia archive and installed development dependencies. It is separate from the minimal release gate.

## Compatibility and versioning

V1 minor and patch releases preserve the documented authoring shapes, class spelling, activation rules, bounded type grammar, and normal layer precedence. Breaking contract changes require a major release. Supported exports can be deprecated in a minor release with a documented replacement and retained behavior until the next major release. Implementation structures, generated formatting, and exact error text are not compatibility promises. Invalid definitions and unknown utilities in active expansions must continue to fail; unused expansions need not be resolved by Tailwind.

The package is ESM and declares Node.js 26 or newer. Repository and downstream type checks use TypeScript 7.0.2. CI runs the minimal release gate on Ubuntu 24.04 with Node 26.9.0. Node 26.0.0 was also checked locally. The verified Tailwind/Vite versions are 4.3.3 and 8.0.11 respectively; the optional Tailwind peer range remains `^4.3.3`. Wider version/OS compatibility is not implied by these checks.

The maintained release checks focus on Varia's behavior and package contents: unit tests, typechecking, lint, the production example build, and one clean install of the actual archive that checks public ESM exports, declaration files, and the layer stylesheet. Tailwind owns editor autocomplete; its behavior does not require a separate ongoing test harness here.

Existing visual and reload checks remain available separately. The visual references use Playwright 1.61.1's bundled Chromium on macOS. They do not establish complete browser support.

### Advanced recipes and themes

The production kitchen-sink example imports Tailwind's full reset and theme. A one-time check in Chromium 152.0.7977.130 on macOS verified inherited and nested palette overrides on button compounds, with an unchanged sibling outside the scope; tooltip hover reveal and always-visible bubbles; progress widths of 25%, 65%, 90%, and 100%, color variants and stripes; and native details/summary panels with open-state caret rotation and suppressed markers. This is a Chromium validation, not a Firefox/WebKit support claim.

Maintained unit tests check that Varia preserves the tooltip attribute/ancestor selectors, progress custom-property width and root-to-slot variant selectors, and accordion marker/open-state selectors. Existing contract tests cover custom themes, nested slots, responsive compounds, and utility precedence. Browser state, CSS variable inheritance, and Tailwind's own utility semantics remain platform behavior; no additional browser harness is required for these recipes.

To repeat the production check, run `pnpm example:build`, then `pnpm --filter @varia/example exec vite preview` and open `/components.html`. Hover the tooltip trigger and move away; the hover bubble should appear and disappear while the always-visible bubble remains. Progress bars should match their labels. Toggle the accordion summaries; panels and carets should follow the native open state. To check scoped themes, put `--color-blue-600` on an ancestor of a `btn btn-c-primary btn-style-solid` element, override it on a nested ancestor, and confirm a sibling outside both scopes retains its default color. The tooltip recipe requires an explicit `group` class on its root and supports hover/always reveal only; accessible focus handling belongs to the consuming application.

## Release preparation

Repository `tsc` and downstream typing checks use TypeScript 7.0.2. The `@typescript/native` dependency is an alias for that stable compiler. ESLint and declaration generation still use the JavaScript compiler API, so `typescript` aliases `@typescript/typescript6` as recommended in [Microsoft's migration guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0). That compatibility package provides `tsc6`; it does not replace TypeScript 7's `tsc`.

Run `pnpm install --frozen-lockfile`, then `pnpm release:prepare`. It builds and packs the package, runs the unit suite against that archive (including a clean npm-install smoke test), typechecks, lints, and builds the production example. CI runs the same command and retains the verified archive as an artifact.

The package's `prepack` hook builds JavaScript, declarations, and the layer stylesheet before an ordinary npm/pnpm pack. Release preparation packs once, tests that archive, and copies it into `.release/` only after all checks succeed. Missing exports/output, install/build/type errors, and failed tests stop preparation. A failed run removes any previous local release artifact. Publish only the verified archive after CI passes. This command does not publish; versioning, licensing, and final release metadata belong to issue [#6](https://github.com/IHIutch/varia/issues/6).

Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm example:build`, `pnpm test:visual`, `pnpm test:reload`, and `pnpm comparison:reload`. The last command verifies native Vite recipe reload in the example. Comparison-only branch parity checks are historical and are not a v1 release gate.
