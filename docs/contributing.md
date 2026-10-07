# Contributing

Use Node.js 26+ and pnpm 12.9.1:

```sh
pnpm install
pnpm build
```

The library is in `packages/varia`, definitions in `recipes`, the demo in `examples/kitchen-sink`, and the VitePress site in `docs`.

## Development

```sh
pnpm example:dev
pnpm docs:dev
```

The demo includes `/components.html` and `/grid.html`. Build the docs with `pnpm docs:build` and inspect them with `pnpm docs:preview`. Static output is `docs/.vitepress/dist`; set `DOCS_BASE=/your-path/` for subdirectory hosting.

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

For browser or reload behavior, also run `pnpm test:visual` or `pnpm test:reload`. Visual references use Chromium on macOS. These checks are separate from the release gate.

For changed setup instructions, test a clean consumer and check its rendered styles as well as build success. The docs build checks page links; verify section anchors too.

## Release preparation

Update the package version and changelog together. From the reviewed commit in a clean checkout:

```sh
pnpm install --frozen-lockfile
pnpm release:prepare
```

Preparation packs once, runs unit and clean-install packaging tests against that archive, typechecks, lints, and builds the example. A successful run copies the archive to `.release/`; failure removes previous local artifacts. CI runs the same checks, builds the docs, and retains the archive. Prepack includes the README, changelog, license, ESM output, declarations, and layer stylesheet.

Inspect the archive and dry-run publication, adjusting the version:

```sh
tar -tzf .release/variacss-1.0.0.tgz
npm publish .release/variacss-1.0.0.tgz --dry-run
```

After publication approval, publish that exact archive with `npm publish .release/variacss-1.0.0.tgz --access public`, then create the matching `v1.0.0` tag and GitHub release from the changelog. Preparation and merging do not publish or create tags.
