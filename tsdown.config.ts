import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/preset.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: 'inline',
  target: 'es2022',
})
