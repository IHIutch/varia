import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/tailwind.ts', 'src/adapter.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  copy: ['src/tailwind.css'],
  sourcemap: 'inline',
  target: 'es2022',
})
