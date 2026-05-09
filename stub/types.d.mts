// varia/types — hand-authored stub copied to dist/types.d.ts during build.
//
// Re-exports the user's locally-generated manifest at node_modules/.varia/manifest.d.ts.
// The relative climb assumes the published package sits at node_modules/varia/dist/types.d.ts
// and the manifest sits at node_modules/.varia/manifest.d.ts (the locked default).
//
// If the user's TypeScript reports "Cannot find module '../../.varia/manifest.js'", they
// need to wire `presetVaria` into their UnoCSS config so the manifest gets generated.
//
// Note for pnpm users: with the default symlinked layout and tsconfig
// `preserveSymlinks: false`, this relative path resolves through the symlink's real
// location and may fail. Set `compilerOptions.preserveSymlinks: true`, or use
// pnpm's `node-linker=hoisted` / `shamefully-hoist=true`.

export type { VariaClasses } from '../../.varia/manifest.js'
