import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  markdown: false,
  // Ignore generated/built output and design-history docs.
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    'adr/**',
    'packages/varia/stub/**',
    'packages/varia/test/recipes/__snapshots__/**',
    'coverage/**',
  ],
})
