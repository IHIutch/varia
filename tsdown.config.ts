import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/preset.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: 'inline',
  target: 'es2022',
  // unocss is the project's peer dep; @unocss/core is imported transitively
  // (we use expandVariantGroup + UnoGenerator.parseToken for slot/compound
  // variant resolution). Both should resolve at the consumer's install site,
  // not get bundled into varia's dist.
  external: ['unocss', /^@unocss\//],
})
