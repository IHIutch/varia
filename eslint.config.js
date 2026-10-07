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
    'packages/varia/test/recipes/__snapshots__/**',
    'coverage/**',
  ],
}, {
  files: ['**/*.{js,mjs,cjs}'],
  rules: {
    // The TypeScript-backed plugin misreads Espree's JavaScript references.
    'unused-imports/no-unused-vars': 'off',
    'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
  },
})
