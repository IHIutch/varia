import { describe, expect, it } from 'vitest'
import { defineComponent } from '../src/index.js'
import { cssRules } from './_css.js'
import { adapter } from './_engine.js'

describe('v1 compound condition contract', () => {
  it.each([undefined, 'tw'])('modifies only the first condition with prefix %s', async (prefix) => {
    const definition = defineComponent('contract', {
      variants: { active: 'opacity-50', accent: 'block' },
      compoundVariants: [{ when: { active: true, accent: true }, class: 'opacity-75' }],
    })
    const cls = (name: string) => prefix ? `${prefix}:${name}` : name
    const responsive = (name: string) => prefix ? `${prefix}:md:${name}` : `md:${name}`
    const rules = cssRules(await adapter.generate([definition], [responsive('contract-active'), responsive('contract-accent')], { prefix }))
    const compounds = rules.filter(rule => rule.layer === 'varia.compounds')
    expect(compounds).toContainEqual(expect.objectContaining({
      selector: `.${responsive('contract-active').replaceAll(':', '\\:')}${prefix ? `[class~="${cls('contract-accent')}"]` : '.contract-accent'}`,
      media: ['(min-width: 48rem)'],
      decls: expect.objectContaining({ opacity: '.75' }),
    }))
    expect(compounds.some(rule => rule.selector.includes(responsive('contract-accent').replaceAll(':', '\\:')))).toBe(false)
  })

  it('uses when order to choose the modified activation condition', async () => {
    const definition = defineComponent('reversed', {
      variants: { active: 'opacity-50', accent: 'block' },
      compoundVariants: [{ when: { accent: true, active: true }, class: 'opacity-75' }],
    })
    const onlyLaterCondition = cssRules(await adapter.generate([definition], ['md:reversed-active']))
    expect(onlyLaterCondition.some(rule => rule.layer === 'varia.compounds')).toBe(false)
    const rules = cssRules(await adapter.generate([definition], ['md:reversed-accent', 'reversed-active']))
    expect(rules).toContainEqual(expect.objectContaining({
      layer: 'varia.compounds',
      selector: '.md\\:reversed-accent.reversed-active',
      media: ['(min-width: 48rem)'],
    }))
  })
})

it('reserves declared slot names when classifying variant values', () => {
  const card = defineComponent('contract-card', {
    slots: { root: 'block', title: 'block' },
    variants: { tone: { root: 'opacity-50' }, size: { sm: { title: 'opacity-75' }, lg: 'p-4' } },
  })
  expect(card.classNames).toEqual(['contract-card', 'contract-card__title', 'contract-card-tone', 'contract-card-size-sm', 'contract-card-size-lg'])
  expect(() => defineComponent('ambiguous', {
    slots: { root: 'block' },
    variants: { tone: { root: 'block', primary: 'block' } },
  })).toThrow(/invalid shape/)
})
