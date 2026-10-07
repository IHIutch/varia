import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  markdown: false,
  // Ignore generated output and visual test artifacts.
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    '**/__snapshots__/**',
    '**/.vitest/**',
    '**/.vitepress/cache/**',
    '**/.vitepress/.temp/**',
    '.release/**',
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
