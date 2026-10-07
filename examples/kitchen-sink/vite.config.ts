import { utimesSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import './tailwind.config.js'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // IntelliSense 0.16 watches CSS/@plugin files, not the plugin's imports.
    const now = new Date()
    utimesSync(resolve(here, 'styles.css'), now, now)
  }
  return {
    root: here,
    plugins: [tailwindcss()],
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
        },
      },
    },
  }
})
