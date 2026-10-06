import { components as recipes } from '../../../../examples/kitchen-sink/recipe-components.js'
import { defineComponent } from '../../src/index.js'

export const components = [...recipes, defineComponent('probe', {
  slots: { root: 'block p-4 bg-gray-100', title: 'block p-2 bg-blue-600 text-white opacity-100' },
  variants: { active: { title: 'opacity-50 focus:opacity-75' }, accent: 'opacity-25' },
  compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
})]

export const classes = [
  ...components.flatMap(component => component.manifest.classNames),
  'hover:probe-active',
  'md:probe-active',
  'opacity-100',
  'text-red-600',
]
