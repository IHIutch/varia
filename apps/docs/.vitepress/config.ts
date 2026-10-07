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
      { text: 'Quickstart', link: '/quickstart' },
      { text: 'Guides', link: '/documentation#guides' },
      { text: 'Concepts', link: '/concepts' },
      { text: 'Reference', link: '/reference/definitions' },
      { text: 'Recipes', link: '/recipes/' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Overview', link: '/documentation' },
            { text: 'Quickstart', link: '/quickstart' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Tailwind CSS', link: '/tailwind' },
            { text: 'Slots', link: '/guides/style-child-elements' },
            { text: 'Responsive variants', link: '/guides/responsive-variants' },
            { text: 'Overrides', link: '/guides/override-styles' },
            { text: 'Theming', link: '/theming' },
            { text: 'Editor support', link: '/recipes/type-safety' },
            { text: 'Troubleshooting', link: '/troubleshooting' },
          ],
        },
        {
          text: 'Concepts',
          items: [
            { text: 'Concepts', link: '/concepts' },
            { text: 'Comparison', link: '/comparison' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Definitions', link: '/reference/definitions' },
            { text: 'Naming convention', link: '/naming' },
            { text: 'Options', link: '/tailwind#options' },
            { text: 'Compatibility', link: '/reference/compatibility' },
          ],
        },
        {
          text: 'Recipes',
          items: [
            { text: 'Overview', link: '/recipes/' },
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
          text: 'Contributing',
          items: [{ text: 'Contributing', link: '/contribute' }],
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
