# Adapter comparison

This is a historical record of the pre-release Tailwind/UnoCSS comparison. Its `varia/*` imports, manifests, and setup commands describe those branches. Current Varia uses `variacss`; follow [Quickstart](../quickstart.md) for its API and setup. Comparison branch parity is not a v1 release gate.

Compare `tailwind-mvp` and `unocss-minimal` against `comparison-base`, their shared merge base. Each implementation has one CSS engine. The common baseline contains definitions, validation, manifests, recipes, demo markup, and engine-independent tests. It is an extraction baseline rather than a runnable styling integration.

## Required behavior

Both adapters must pass the identical contract and recipe suites:

- Generate only referenced base and activation classes. Slot variants activate every slot rule; compounds activate through their first condition.
- Preserve states and arbitrary selectors inside definitions on the styled element. Usage-site states such as `hover:card-accent` apply to the activation element before selecting descendant slots.
- Order normal declarations as base, variants, compounds, then atomic utilities through cascade layers.
- Resolve themes, custom utilities, arbitrary values, responsive classes, important modifiers, and user CSS `@apply`.
- Fail on unknown utilities in active component expansions, including slots and compounds.
- Validate duplicate names, malformed definitions, and prefixes. Reject variant groups outside arbitrary-value brackets.
- Write prefixed manifests, aggregate registrations, and replace stale classes on config reload.
- Load packaged adapters and TypeScript definitions through the real engine loader. Import built adapters without requiring the CSS engine at module-import time.

Engine-native prefix spelling is allowed: Tailwind uses `tw:card`; UnoCSS uses `tw-card`. Generated CSS formatting, private variable names, engine preflights, and conditional browser fallbacks may differ. Expansions preserve the selected engine's native utility ordering. The shared regression checks padding shorthand before axis padding and responsive md before lg in slot and compound expansions. This does not promise parity for every equal-specificity conflict across engines.

## Setup

Use Node.js 22 or newer and pnpm. Run `pnpm install`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm example:build` on each implementation branch.

Tailwind registers `tailwindVaria` from `varia/tailwind`. Import `varia/tailwind.css` before `tailwindcss`, then load the plugin config. UnoCSS registers `presetVaria` from `varia/unocss` alongside `presetWind4` and requires `outputToCssLayers: true`. Each branch includes its own example configuration.

The test seam is `packages/varia/test/_engine.ts`. Historical comparison branches used the engine-neutral `varia/adapter` alias for packaging verification. Shared tests must not convert engine warnings into failures on behalf of the production adapter.

## Comparing implementation cost

Use `git diff comparison-base...tailwind-mvp` and `git diff comparison-base...unocss-minimal`. Compare adapter code separately from integration helpers and engine dependencies. Both branches must keep shared source, recipes, demo markup, and shared tests identical. For uncommitted extensions in isolated worktrees, run `pnpm comparison:check -- --worktrees /tmp/varia-extend-tailwind /tmp/varia-extend-unocss` as well. The default command checks committed branch refs against the original baseline; the worktree option also compares current shared files, including untracked fixtures. Run `pnpm comparison:reload` on each implementation to verify that recipe edits and restoration update served CSS. The shared Vite hook automatically restarts the demo server when recipe files change because the native config loaders do not report the full recipe import graph. Run `pnpm comparison:check` to detect shared-file drift, mixed engine dependencies, or a changed merge base.

Build the same demo entry points with the same markup and recipes. Treat CSS size and timing as whole-engine measurements, including each engine's reset and theme implementation; do not label those figures as adapter overhead. Verify computed styles for compound buttons, nav states, input groups, descendant slots, and utility overrides before claiming rendered parity. Build success alone does not establish visual parity.

## Verified comparison

Both branches run the same shared tests, typechecking, lint, and production demo build. Test totals can change as the shared contract grows and do not establish adapter quality. Tailwind additionally has three native integration tests for prefix configuration and reference stylesheets. The shared suite covers both engines through the same assertions, including all existing recipe tests.

Browser checks on the production builds matched input-group inner and outer corner radii, collapsed border margins, compound button colors and padding, dropdown closed/open display, and nav tab/pill active and disabled states. Colors were compared as rendered 8-bit sRGB values because the engines serialize equivalent colors differently. These sampled checks do not claim pixel equality for every demo state.

## Visual regression tests

Run `pnpm --filter varia exec playwright install chromium` once, then `pnpm test:visual` on each implementation branch. The shared Vitest Browser Mode suite compiles the same recipes through the selected adapter and runs eleven Chromium tests with seven unchanged screenshot references. Five added tests use geometry and computed styles for equal-width columns, explicit halves without wrapping, vertical gutters, offsets, ordering, nested independent gutters, responsive widths/gutters at 767/768/1023/1024px, and native utility ordering in slots and compounds. It checks button compounds and utility overrides, input-group corners, navigation states, dropdown activation, slot hover/focus, responsive variants, and cascade precedence. Computed-style assertions accompany the screenshots.

Both branches must use the same reference PNGs. Review a deliberate change on one branch with `pnpm test:visual --update`, copy the reviewed references to `comparison-base`, and merge that baseline into both branches. Never update each engine's references independently to hide differences. `pnpm comparison:check` includes the browser fixtures and references in its shared-file check.

The browser provider and Playwright versions are pinned. References are currently for Chromium on macOS (`chromium-darwin`); use one fixed operating system for comparisons. A Linux CI setup needs its own reviewed references shared by both branches. Screenshot comparison permits no mismatched pixels beyond a per-pixel color threshold of 0.1. The fixtures use a common reset and font to test adapter output; engine preflights and every demo state are outside this visual suite's scope.

## Typed downstream classes

The strict helper supports bare Varia classes and one configured responsive modifier:

```ts
import type { VariaClasses } from 'varia/types'

export function cn(...classes: VariaClasses[]): string {
  return classes.join(' ')
}

cn('row', 'row-g-3')
cn('col', 'md:col-span-6', 'lg:col-span-4')
```

Register the adapter with manifest emission enabled, run the native engine build, then typecheck. The build writes `node_modules/.varia/manifest.d.ts`. Add that file to `compilerOptions`' sibling `files` array in your project tsconfig. Use `files` rather than an include glob if your tsconfig excludes node_modules:

```json
{
  "files": ["node_modules/.varia/manifest.d.ts"],
  "include": ["src/**/*.ts"]
}
```

The generated declaration augments `varia/types` in this project. The package itself has no relative dependency on the consumer's node_modules layout. Default pnpm symlink resolution works without preserveSymlinks or hoisting. Without a generated declaration included, VariaClasses is never. Custom manifest paths require the corresponding files entry. Include one aggregate manifest per TypeScript project; manifests from separate engines or configurations are separate projects.

Responsive names come from the engine's resolved breakpoints. Tailwind reads `screens` through PluginAPI.theme; UnoCSS reads theme.breakpoint. Prefix spelling follows each engine: `tw:md:col-span-6` for Tailwind and `md:tw-col-span-6` for UnoCSS. Unknown recipes, unconfigured breakpoints, atomic utilities, states, arbitrary variants, and stacked modifiers are outside this strict type contract. CSS engines may support more syntax; the type helper deliberately does not model that grammar.

Both engines must scan literal class arguments in source files. Tailwind's example adds `@source "./grid.ts"`; UnoCSS adds grid.ts to content.filesystem and includes plain .ts in content.pipeline.include. UnoCSS filters filesystem entries through the pipeline filter as well. Dynamic construction of class names is outside the scanner contract.

`pnpm typecheck` builds the package and example first so the demo's manifest exists on a clean install. The shared downstream test independently copies the built package to a pnpm-style store, symlinks varia, generates and includes its manifest, compiles the exact cn helper, checks typo rejection and configured breakpoint removal, and builds through the native Vite plugin. It checks responsive CSS from literal TypeScript calls and absence of unused recipe output. Registration reload tests replace stale manifest entries; the recipe server reload check remains `pnpm comparison:reload`.

Open `/grid.html` in the example dev server to inspect the typed responsive grid. The generated type union does not make CSS eager; the engine still emits referenced classes only. Neither helper merges classes nor changes engine precedence. Developers remain responsible for component names that collide with native utilities.

## Native extension experiment

The shared product contract remains the basis for comparison. Engine-specific
extensions use each engine's own APIs and need not have identical syntax or
identical native test totals.

UnoCSS expands recursive and dynamic shortcuts through `expandShortcut`, resolves
rules and variants through `matchVariants`, `makeContext`, and `parseUtil`, and
leaves final declaration serialization, merging, and preflight activation to the
engine. Varia still composes usage-site states, component selectors, definition
states, and component layers, and forwards native ordering and rule metadata.
These generator methods are public typed APIs in the installed engine. Their
lower-level contracts still need compatibility checks on engine upgrades; this
experiment validates version 66.10.5, not every version allowed by the peer range.

Native object rules, selector handlers through `symbols.selector`, inline shortcut
bodies, and exact `ctx.constructCSS(body)` results work inside recipes. Within Varia, `ctx.constructCSS(body)` snapshots scoped declarations and returns
an opaque token. An unchanged returned token defers serialization to the final
engine pass, preserving activation and layers while running postprocessors once.
Inspecting, branching on, transforming, or concatenating that token as generated
CSS is unsupported; this bridge does not promise native CSS-string return fidelity. Free-form CSS strings and
raw `constructCSS` selector overrides receive explicit errors. Raw strings beginning with `@keyframes ` pass through verbatim as global
dependencies. They are never retargeted: custom authors must not append scoped
selector CSS to that form. Other free-form strings receive explicit errors. Prefer
object rules for scoped declarations and engine preflights for global dependencies.

For UnoCSS downstream authored CSS, install and configure
`@unocss/transformer-directives`, import `virtual:uno.css` in the application entry,
and import authored CSS separately. The example injects the native import into
its shared HTML entries. It does not alias away the authored stylesheet.
Tailwind processes authored CSS and native `@apply` through its Vite plugin.
The shared downstream test builds an actual consumer and checks both authored
rules and a component `@apply` expansion. Native generated layer placement can
differ while the authored behavior remains supported.

UnoCSS's programmable shortcuts and custom rule handlers are additional authoring
choices, rather than failed attempts to emulate Tailwind CSS utility declarations.
The tests exercise recursive and dynamic shortcuts, inline bodies, custom object
rules, custom selector handlers, constructed raw bodies, states, prefixes, unknown
shortcut leaves, ordering, and dependency emission. Custom extractors, every preset,
and all possible raw CSS forms are not covered by this experiment.

The native ordering bridge preserves rule index first, then rule metadata sort and
standard `VariantHandler.sort` properties. It maps those pairs to ranks in the
single enclosing Varia rule. Equal pairs remain equal ranks; the engine breaks
remaining ties using rendered Varia selectors and bodies, not original atomic
class spellings. Such conflicts remain outside the shared portable contract.
Custom `handle` callbacks that synthesize sort values dynamically and postprocessors
that change ordering metadata are not resolved by this bridge. Calling
`stringifyUtil` just to probe metadata was rejected because it executes configured
postprocessors before final serialization. Native regression tests cover explicit
rule sort, precedence of rule index over opposite sorts, standard variant sort,
and one postprocessor execution per supported object or constructed-body rule.
