import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  markdown: false,
  // Ignore generated/built output and design-history docs.
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    'apps/docs/.vitepress/cache/**',
    'apps/docs/.vitepress/dist/**',
    'adr/**',
    'packages/varia/stub/**',
    'recipes/_proto/**',
    'packages/varia/test/recipes/__snapshots__/**',
    'coverage/**',
  ],
})
