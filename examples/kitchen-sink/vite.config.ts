import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: here,
  plugins: [tailwindcss()],
  build: {
    outDir: resolve(here, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(here, 'index.html'),
        components: resolve(here, 'components.html'),
        navVaria: resolve(here, 'nav-comparison.html'),
        navBootstrap: resolve(here, 'nav-bootstrap.html'),
      },
    },
  },
})
