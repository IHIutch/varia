import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, postcssIsolateStyles } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import '../tailwind.config.js'

export default defineConfig({
  title: 'Varia',
  description: 'On-demand CSS with the ergonomics of regular CSS classes',
  cleanUrls: true,
  lastUpdated: true,
  base: process.env.DOCS_BASE ?? '/',

  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },

  vite: {
    plugins: [tailwindcss(), groupIconVitePlugin()],
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
      { text: 'Guides', link: '/guides/basic-component' },
      { text: 'Recipes', link: '/recipes/' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Quickstart', link: '/quickstart' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Basic component', link: '/guides/basic-component' },
            { text: 'Variants', link: '/guides/variants' },
            { text: 'Slots', link: '/guides/slots' },
            { text: 'Compound variants', link: '/guides/compound-variants' },
            { text: 'Responsive variants', link: '/guides/responsive-variants' },
            { text: 'Overrides', link: '/guides/overrides' },
            { text: 'Theming', link: '/theming' },
            { text: 'Troubleshooting', link: '/troubleshooting' },
          ],
        },
        {
          text: 'Recipes',
          items: [
            { text: 'Overview', link: '/recipes/' },
            { text: 'Avatar', link: '/recipes/avatar' },
            { text: 'Button', link: '/recipes/button' },
            { text: 'Card', link: '/recipes/card' },
            { text: 'Dropdown', link: '/recipes/dropdown' },
            { text: 'Form input', link: '/recipes/form-input' },
            { text: 'Grid', link: '/recipes/grid' },
            { text: 'Icon button', link: '/recipes/icon-button' },
            { text: 'Modal', link: '/recipes/modal' },
            { text: 'Spinner', link: '/recipes/spinner' },
          ],
        },
        {
          text: 'Contributing',
          items: [{ text: 'Contributing', link: '/contributing' }],
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
