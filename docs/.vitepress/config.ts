import { fileURLToPath } from 'node:url'
import { defineConfig, postcssIsolateStyles } from 'vitepress'
import UnoCSS from '@unocss/vite'

const docsDir = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  title: 'varia',
  description: 'Build-time variants for UnoCSS',
  cleanUrls: true,
  lastUpdated: true,
  base: process.env.DOCS_BASE ?? '/',

  vite: {
    // @unocss/vite ships Vite 8 plugin types; VitePress 1.x ships Vite 5
    // plugin types. The two type chains don't unify in @types space even
    // though the runtime API is identical. Cast to silence the IDE; the
    // build verifies the runtime contract.
    plugins: [
      UnoCSS({
        configFile: `${docsDir}/unocss.config.ts`,
      }),
    ] as never,
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
      { text: 'API', link: '/api' },
      { text: 'Naming', link: '/naming' },
      { text: 'Recipes', link: '/recipes/button' },
      { text: 'Comparison', link: '/comparison' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Quickstart', link: '/quickstart' },
            { text: 'API reference', link: '/api' },
            { text: 'Naming convention', link: '/naming' },
            { text: 'Comparison', link: '/comparison' },
          ],
        },
        {
          text: 'Recipes',
          items: [
            { text: 'Button', link: '/recipes/button' },
            { text: 'Card', link: '/recipes/card' },
            { text: 'Form input', link: '/recipes/form-input' },
            { text: 'Spinner', link: '/recipes/spinner' },
            { text: 'Avatar', link: '/recipes/avatar' },
            { text: 'Dropdown', link: '/recipes/dropdown' },
          ],
        },
      ],
    },

    socialLinks: [],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026',
    },
  },
})
