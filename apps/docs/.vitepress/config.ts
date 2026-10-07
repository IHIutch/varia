import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, postcssIsolateStyles } from 'vitepress'
import '../tailwind.config.js'

export default defineConfig({
  title: 'Varia',
  description: 'On-demand CSS with the ergonomics of regular CSS classes',
  cleanUrls: true,
  lastUpdated: true,
  base: process.env.DOCS_BASE ?? '/',

  vite: {
    plugins: [tailwindcss()],
    server: { warmup: { clientFiles: ['./tailwind.css'] } },
    css: {
      postcss: {
        plugins: [
          // Apply VitePress's vp-raw isolation to its own theme styles so
          // ::: raw containers (and class="vp-raw" wrappers) actually escape
          // the .vp-doc prose cascade. By default VitePress only exposes this
          // utility to USER css files matching base.css; we widen it to
          // VitePress's vp-doc styles.
          postcssIsolateStyles({
            includeFiles: [/vp-doc\.css/, /base\.css/],
          }),
        ],
      },
    },
  },

  themeConfig: {
    nav: [
      { text: 'Get started', link: '/quickstart' },
      { text: 'Guides', link: '/documentation#complete-a-task' },
      { text: 'Concepts', link: '/concepts' },
      { text: 'Reference', link: '/reference/definitions' },
      { text: 'Recipes', link: '/recipes/' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Get started',
          items: [
            { text: 'Documentation overview', link: '/documentation' },
            { text: 'Your first component style', link: '/quickstart' },
          ],
        },
        {
          text: 'How-to guides',
          items: [
            { text: 'Integrate with Tailwind', link: '/tailwind' },
            { text: 'Style child elements', link: '/guides/style-child-elements' },
            { text: 'Responsive variants and compounds', link: '/guides/responsive-variants' },
            { text: 'Override styles and configure prefixes', link: '/guides/override-styles' },
            { text: 'Customize the theme', link: '/theming' },
            { text: 'Set up editor support', link: '/recipes/type-safety' },
            { text: 'Troubleshooting', link: '/troubleshooting' },
          ],
        },
        {
          text: 'Concepts',
          items: [
            { text: 'The styling model', link: '/concepts' },
            { text: 'Compare approaches', link: '/comparison' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Definition shapes and imports', link: '/reference/definitions' },
            { text: 'Class naming and compounds', link: '/naming' },
            { text: 'Integration options', link: '/tailwind#options' },
            { text: 'Compatibility and versioning', link: '/reference/compatibility' },
          ],
        },
        {
          text: 'Recipes',
          items: [
            { text: 'Recipe overview', link: '/recipes/' },
            { text: 'Button', link: '/recipes/button' },
            { text: 'Card', link: '/recipes/card' },
            { text: 'Form input', link: '/recipes/form-input' },
            { text: 'Spinner', link: '/recipes/spinner' },
            { text: 'Avatar', link: '/recipes/avatar' },
            { text: 'Dropdown', link: '/recipes/dropdown' },
            { text: 'Modal', link: '/recipes/modal' },
            { text: 'Icon button', link: '/recipes/icon-button' },
            { text: 'Grid', link: '/recipes/grid' },
          ],
        },
        {
          text: 'Contribute',
          items: [{ text: 'Repository setup and checks', link: '/contribute' }],
        },
      ],
    },

    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/IHIutch/varia' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026',
    },
  },
})
