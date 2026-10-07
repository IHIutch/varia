# Contributing

Use Node.js 26+ and pnpm 12.9.1. See [contributor documentation](docs/contributing.md) for setup, checks, and releases.

```sh
pnpm install
pnpm docs:dev
```

## Repository layout

- `packages/varia/` contains the published library and its tests. Shared test utilities live in `test/helpers/`.
- `recipes/` contains component definitions. `recipes/index.ts` registers the shared collection used by the docs, demo, and tests.
- `docs/` contains the VitePress site.
- `examples/kitchen-sink/` contains the Vite demo.
- `scripts/` contains release and verification commands.
