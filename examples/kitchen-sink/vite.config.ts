import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { enginePlugin } from './engine.js'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: here,
  plugins: [enginePlugin(), {
    name: 'varia-recipe-reload',
    configureServer(server) {
      // Engine config loaders do not expose the recipe import graph to Vite.
      const recipes = resolve(here, '../../recipes')
      server.watcher.add(recipes)
      const reload = (file: string): void => {
        if (file.startsWith(`${recipes}/`) && file.endsWith('.ts'))
          void server.restart()
      }
      server.watcher.on('change', reload)
      server.watcher.on('add', reload)
      server.watcher.on('unlink', reload)
    },
  }],
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
