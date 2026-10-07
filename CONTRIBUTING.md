# Contributing

See [repository setup and checks](apps/docs/contribute.md) for prerequisites, the demo, verification commands, and the documentation site.

From the repository root, use Node.js 26 or newer and pnpm 12.9.1:

```sh
pnpm install
pnpm docs:dev
```

The VitePress documentation lives in `apps/docs`. Run `pnpm docs:build` to build it and `pnpm docs:preview` to inspect the static output.
