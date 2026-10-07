import css from 'virtual:varia-browser-css'
import { beforeEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

const style = document.createElement('style')
style.textContent = css
document.head.append(style)

beforeEach(async () => {
  document.body.innerHTML = '<main id="contract-fixture"></main>'
  await page.viewport(767, 768)
})

function render(markup: string) {
  document.querySelector('#contract-fixture')!.innerHTML = markup
}

function opacity(id: string) {
  return getComputedStyle(document.querySelector(`#${id}`)!).opacity
}

it('matches compounds only when later conditions have their bare class', async () => {
  render(`<div id="bare" class="contract-active contract-accent"></div>
    <div id="first" class="contract md:contract-active contract-accent"></div>
    <div id="later" class="contract contract-active md:contract-accent"></div>
    <div id="both" class="contract md:contract-active md:contract-accent"></div>
    <div id="different" class="contract md:contract-active lg:contract-accent"></div>`)
  for (const [viewport, first, both] of [[767, '1', '1'], [768, '0.75', '0.5'], [1024, '0.75', '0.5']] as const) {
    await page.viewport(viewport, 768)
    expect(opacity('bare')).toBe('0.75')
    expect(opacity('first')).toBe(first)
    expect(opacity('later')).toBe('0.5')
    expect(opacity('both')).toBe(both)
    expect(opacity('different')).toBe(both)
  }
})

it('targets all matching descendant slots including nested instances', async () => {
  render(`<div id="self" class="contract-card-accent contract-card__title">
      <div><span id="deep" class="contract-card__title"></span></div>
      <div class="contract-card"><span id="nested" class="contract-card__title"></span></div>
      <span id="distinct" class="contract-inner__title"></span>
      <span id="modified" class="md:contract-card__title"></span>
      <span id="override" class="contract-card__title opacity-100"></span>
    </div>
    <span id="outside" class="contract-card__title"></span>`)
  await page.viewport(768, 768)
  expect(opacity('self')).toBe('1')
  expect(opacity('deep')).toBe('0.5')
  expect(opacity('nested')).toBe('0.5')
  expect(opacity('distinct')).toBe('1')
  expect(opacity('modified')).toBe('1')
  expect(opacity('override')).toBe('1')
  expect(opacity('outside')).toBe('1')
})
