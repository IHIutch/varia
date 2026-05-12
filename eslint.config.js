import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  markdown: false,
  // Ignore generated/built output and design-history docs.
  ignores: [
    'dist/**',
    'node_modules/**',
    'docs/.vitepress/cache/**',
    'docs/.vitepress/dist/**',
    'adr/**',
    'stub/**',
    'recipes/_proto/**',
    'test/recipes/__snapshots__/**',
    'coverage/**',
    '.varia/**',
  ],
})
