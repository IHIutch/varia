import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import { adapter } from './test/_engine.js'
import { classes, components } from './test/browser/fixtures.js'

const moduleId = '\0varia-browser-css'

export default defineConfig({
  plugins: [{
    name: 'varia-browser-css',
    resolveId: id => id === 'virtual:varia-browser-css' ? moduleId : undefined,
    async load(id) {
      if (id === moduleId)
        return `export default ${JSON.stringify(await adapter.generate(components, classes))}`
    },
  }],
  test: {
    name: 'visual',
    include: ['test/browser/**/*.vrt.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium', viewport: { width: 1024, height: 768 } }],
      expect: {
        toMatchScreenshot: {
          comparatorOptions: { threshold: 0.1, allowedMismatchedPixels: 0 },
        },
      },
    },
  },
})
