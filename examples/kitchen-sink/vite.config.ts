import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { enginePlugin } from './engine.js'
import './tailwind.config.js'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: here,
  plugins: [enginePlugin()],
  server: {
    warmup: { clientFiles: ['./styles.css'] },
  },
  build: {
    outDir: resolve(here, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(here, 'index.html'),
        grid: resolve(here, 'grid.html'),
        components: resolve(here, 'components.html'),
        navVaria: resolve(here, 'nav-comparison.html'),
        navBootstrap: resolve(here, 'nav-bootstrap.html'),
      },
    },
  },
})
