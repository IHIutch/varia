import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import RecipeTabs from './components/RecipeTabs.vue'
import 'virtual:group-icons.css'
import '../../tailwind.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RecipeTabs', RecipeTabs)
  },
} satisfies Theme
