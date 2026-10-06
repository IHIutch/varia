# Adapter comparison

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

Engine-native prefix spelling is allowed: Tailwind uses `tw:card`; UnoCSS uses `tw-card`. Generated CSS formatting, private variable names, engine preflights, and conditional browser fallbacks may differ. Equal-specificity conflicts within one layer are not a portable API; recipes must express intended precedence explicitly.

## Setup

Use Node.js 22 or newer and pnpm. Run `pnpm install`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm example:build` on each implementation branch.

Tailwind registers `tailwindVaria` from `varia/tailwind`. Import `varia/tailwind.css` before `tailwindcss`, then load the plugin config. UnoCSS registers `presetVaria` from `varia/unocss` alongside `presetWind4` and requires `outputToCssLayers: true`. Each branch includes its own example configuration.

The test seam is `packages/varia/test/_engine.ts`. The engine-neutral package import `varia/adapter` exports `createAdapter` for packaging verification; consumers can use the native named integration. Shared tests must not convert engine warnings into failures on behalf of the production adapter.

## Comparing implementation cost

Use `git diff comparison-base...tailwind-mvp` and `git diff comparison-base...unocss-minimal`. Compare adapter code separately from integration helpers and engine dependencies. Both branches must keep shared source, recipes, demo markup, and shared tests identical. Run `pnpm comparison:reload` on each implementation to verify that recipe edits and restoration update served CSS. The shared Vite hook automatically restarts the demo server when recipe files change because the native config loaders do not report the full recipe import graph. Run `pnpm comparison:check` to detect shared-file drift, mixed engine dependencies, or a changed merge base.

Build the same demo entry points with the same markup and recipes. Treat CSS size and timing as whole-engine measurements, including each engine's reset and theme implementation; do not label those figures as adapter overhead. Verify computed styles for compound buttons, nav states, input groups, descendant slots, and utility overrides before claiming rendered parity. Build success alone does not establish visual parity.

## Verified comparison

Both branches pass the same 136 shared tests, typechecking, lint, and production demo build. Tailwind additionally has three native integration tests for prefix configuration and reference stylesheets. The shared suite covers both engines through the same assertions, including all existing recipe tests.

Browser checks on the production builds matched input-group inner and outer corner radii, collapsed border margins, compound button colors and padding, dropdown closed/open display, and nav tab/pill active and disabled states. Colors were compared as rendered 8-bit sRGB values because the engines serialize equivalent colors differently. These sampled checks do not claim pixel equality for every demo state.

## Visual regression tests

Run `pnpm --filter varia exec playwright install chromium` once, then `pnpm test:visual` on each implementation branch. The shared Vitest Browser Mode suite compiles the same recipes through the selected adapter and runs six Chromium tests with seven screenshot references. It checks button compounds and utility overrides, input-group corners, navigation states, dropdown activation, slot hover/focus, responsive variants, and cascade precedence. Computed-style assertions accompany the screenshots.

Both branches must use the same reference PNGs. Review a deliberate change on one branch with `pnpm test:visual --update`, copy the reviewed references to `comparison-base`, and merge that baseline into both branches. Never update each engine's references independently to hide differences. `pnpm comparison:check` includes the browser fixtures and references in its shared-file check.

The browser provider and Playwright versions are pinned. References are currently for Chromium on macOS (`chromium-darwin`); use one fixed operating system for comparisons. A Linux CI setup needs its own reviewed references shared by both branches. Screenshot comparison permits no mismatched pixels beyond a per-pixel color threshold of 0.1. The fixtures use a common reset and font to test adapter output; engine preflights and every demo state are outside this visual suite's scope.
