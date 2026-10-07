# Contributing

Use Node.js 26+ and pnpm 12.9.1:

```sh
pnpm install
pnpm build
```

The library is in `packages/varia`. Shared component definitions are in `recipes`, the demo is in `examples/kitchen-sink`, and the VitePress site is in `docs`.

## Development

```sh
pnpm example:dev
pnpm docs:dev
```

The demo includes `/components.html` and `/grid.html`. Build the docs with `pnpm docs:build` and inspect them with `pnpm docs:preview`. The build writes static files to `docs/.vitepress/dist`. Set `DOCS_BASE=/your-path/` when building for a subdirectory.

## Verify changes

Run checks relevant to the change:

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm example:build
pnpm docs:build
```

CI uses Node 26.9.0, Tailwind 4.3.3, Vite 8.3.2, and TypeScript 6.0.3 on Ubuntu 24.04.

For browser or reload behavior, also run `pnpm test:visual` or `pnpm test:reload`. Visual references use Chromium on macOS. Release preparation does not run these checks.

When changing setup instructions, follow them in a new consumer project. Check that the build succeeds and the component styles render. The docs build checks page links; verify section anchors too.

## Release preparation

Update the package version and changelog together. From the reviewed commit in a clean checkout:

```sh
pnpm install --frozen-lockfile
pnpm release:prepare
```

Preparation creates one package archive, then runs unit tests, checks types, lints, and builds the example. The test suite includes clean-install packaging tests against that archive. On success, it copies the archive to `.release/`. On failure, it removes previous local release artifacts.

CI runs the same checks, builds the docs, and retains the archive. The package includes the README, changelog, license, ESM output, type declarations, and layer stylesheet.

Inspect the archive and dry-run publication, adjusting the version:

```sh
tar -tzf .release/variacss-1.0.0.tgz
npm publish .release/variacss-1.0.0.tgz --dry-run
```

After publication approval, publish that exact archive with `npm publish .release/variacss-1.0.0.tgz --access public`, then create the matching `v1.0.0` tag and GitHub release from the changelog. Preparation and merging do not publish or create tags.
