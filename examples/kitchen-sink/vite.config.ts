import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import UnoCSS from '@unocss/vite'
import { defineConfig } from 'vite'

const here = dirname(fileURLToPath(import.meta.url))

// `--mode unocss` serves the same pages and recipes through UnoCSS.
export default defineConfig(({ mode }) => {
  const unocss = mode === 'unocss'
  return {
    root: here,
    plugins: [unocss ? UnoCSS({ configFile: resolve(here, 'uno.config.ts') }) : tailwindcss()],
    resolve: {
      alias: unocss ? [{ find: /^\.\/tailwind\.css$/, replacement: 'virtual:uno.css' }] : [],
    },
    build: {
      outDir: resolve(here, unocss ? 'dist/unocss' : 'dist'),
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
  }
})
