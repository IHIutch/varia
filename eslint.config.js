import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  // Vue / React / Astro etc. — varia ships no framework code.
  vue: false,
  react: false,
  // Formatters off; antfu's stylistic ruleset handles formatting for us.
  formatters: false,
  // Markdown lint off. The .md files in this repo (docs/, adr/) are
  // documentation, not source — their TS code blocks are illustrative
  // snippets and partial type fragments that don't (and shouldn't) parse
  // as real code.
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
