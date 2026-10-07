import { components as recipes } from '../../../../examples/kitchen-sink/recipe-components.js'
import { defineComponent } from '../../src/index.js'

export const components = [...recipes, defineComponent('probe', {
  slots: { root: 'block p-4 bg-gray-100', title: 'block p-2 bg-blue-600 text-white opacity-100' },
  variants: { active: { title: 'opacity-50 focus:opacity-75' }, accent: 'opacity-25' },
  compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
}), defineComponent('ordered', {
  slots: { root: 'block', title: 'block' },
  variants: { active: { title: 'lg:opacity-75 md:opacity-50 px-2 p-4' }, accent: 'block' },
  compoundVariants: [{ when: { active: true, accent: true }, class: 'lg:opacity-75 md:opacity-50 px-2 p-4' }],
}), defineComponent('contract', {
  base: 'opacity-100',
  variants: { active: 'opacity-50', accent: 'block' },
  compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
}), defineComponent('contract-card', {
  slots: { root: 'block', title: 'opacity-100' },
  variants: { accent: { title: 'opacity-50' } },
}), defineComponent('contract-inner', {
  slots: { title: 'opacity-100' },
})]

export const classes = [
  ...components.flatMap(component => component.manifest.classNames),
  'hover:probe-active',
  'md:probe-active',
  'md:col-span-6',
  'lg:col-span-4',
  'md:row-g-3',
  'lg:row-g-5',
  'md:contract-active',
  'md:contract-accent',
  'lg:contract-accent',
  'md:contract-card__title',
  'opacity-100',
  'text-red-600',
]
