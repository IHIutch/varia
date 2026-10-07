import { defineComponent } from 'varia'
import { tailwindVaria } from 'varia/tailwind'

export default tailwindVaria({
  components: [defineComponent('fixture', { base: 'block', variants: { active: 'opacity-50' } })],
  manifest: false,
})
