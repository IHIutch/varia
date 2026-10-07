import { defineComponent } from 'variacss'
import { tailwindVaria } from 'variacss/tailwind'

export default tailwindVaria({
  components: [defineComponent('fixture', { base: 'block', variants: { active: 'opacity-50' } })],
})
