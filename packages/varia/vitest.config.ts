import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: ['test/browser/**', 'test/**/*.reload.test.ts'],
    globalSetup: ['test/global-setup.ts'],
  },
})
