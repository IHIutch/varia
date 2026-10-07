# Contributing

This checkout contains the Tailwind implementation of Varia. For application setup, use [the consumer documentation](/documentation).

## Set up the checkout

Use Node.js 26 or newer and pnpm 12.9.1. From the repository root, run:

```sh
pnpm install
pnpm build
```

The library lives in `packages/varia`, example definitions in `recipes`, and the demo in `examples/kitchen-sink`. [The definition reference](/reference/definitions) defines current public behavior. [the comparison](/comparison) records historical engine experiments.

## Run the demo

```sh
pnpm example:dev
```

Open the URL printed by Vite. Visit `/components.html` for component examples and `/grid.html` for responsive rows and columns. The grid uses ordinary class strings and native Tailwind editor support.

Import the recipe registration module from Vite configuration so Vite tracks definitions and local imports. See [development reload](/tailwind#development-reload).

## Verify changes

Run the checks appropriate to your changes. For a release or changes to public behavior, run:

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm example:build
pnpm test:visual
pnpm test:reload
```

`pnpm typecheck` builds the package before checking workspace types. `pnpm test:visual` runs Chromium browser checks. `pnpm test:reload` verifies native Vite configuration reload; historical comparison branch parity is not a v1 release gate.

For documentation changes, verify local links and follow changed setup instructions in a clean consumer project. Check expected styles after the build, not just whether the command exits successfully. Keep task instructions, conceptual explanations, and exact reference rules linked but focused on their respective purposes.

See [compatibility and versioning](/reference/compatibility) for the limits of current checks and tracked release work.

## Run the documentation site

```sh
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

The VitePress site lives in `apps/docs`; static output is `apps/docs/.vitepress/dist`. Set `DOCS_BASE=/your-path/` when building for a subdirectory. Recipe pages include live style previews.

## Release preparation

Repository `tsc` checks use TypeScript 7.0.2. The `@typescript/native` dependency is an alias for that stable compiler. ESLint and declaration generation still use the JavaScript compiler API, so `typescript` aliases `@typescript/typescript6` as recommended in [Microsoft's migration guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0). That compatibility package provides `tsc6`; it does not replace TypeScript 7's `tsc`.

Run `pnpm install --frozen-lockfile`, then `pnpm release:prepare`. It builds and packs the package, runs the unit suite against that archive (including a clean npm-install smoke test), typechecks, lints, and builds the production example. CI runs the same command and retains the verified archive as an artifact.

The package's `prepack` hook builds JavaScript, declarations, and the layer stylesheet before an ordinary npm/pnpm pack. Release preparation packs once, tests that archive, and copies it into `.release/` only after all checks succeed. Missing exports/output, install/build/type errors, and failed tests stop preparation. A failed run removes any previous local release artifact. Publish only the verified archive after CI passes. The package metadata is prepared for 1.0.0 under the MIT license. Prepack copies the README, changelog, and license into the archive. Version 1.0.0 is prepared in this repository; merging changes does not publish it. The public package name is `variacss`; the brand remains Varia. 

For a release, update the package version and changelog together, merge the reviewed change, and run release preparation from that commit with a clean checkout. Check the archive's version and contents with `tar -tzf .release/variacss-1.0.0.tgz` and `npm publish .release/variacss-1.0.0.tgz --dry-run`. After the verified commit and registry access are approved for publication, publish that exact archive with `npm publish .release/variacss-1.0.0.tgz --access public`, then create the matching `v1.0.0` git tag and GitHub release with the changelog. Adjust the versioned filename/tag for subsequent releases. Publishing an existing tarball preserves the tested contents. Release preparation itself does not publish or create tags.
