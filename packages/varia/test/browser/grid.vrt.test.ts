import css from 'virtual:varia-browser-css'
import { beforeEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

const style = document.createElement('style')
style.textContent = `@layer fixture-reset { * { box-sizing: border-box; border: 0 solid; } body { margin: 0; font: 16px Arial; } }
${css}
#grid { width: 600px; margin: 32px; } .cell { min-height: 20px; }`
document.head.append(style)
beforeEach(async () => {
  document.body.innerHTML = '<main id="grid"></main>'
  await page.viewport(767, 768)
})
function render(markup: string) {
  document.querySelector('#grid')!.innerHTML = markup
}
function node(id: string) {
  return document.querySelector<HTMLElement>(`#${id}`)!
}
function rect(id: string) {
  return node(id).getBoundingClientRect()
}
function width(id: string, expected: number) {
  expect(rect(id).width).toBeCloseTo(expected, 1)
}

it('equal columns and explicit halves preserve gutters without wrapping', () => {
  render(`<div id="equal" class="row row-g-3"><div id="e1" class="col cell"></div><div id="e2" class="col cell"></div><div id="e3" class="col cell"></div></div>
<div id="halves" class="row row-g-3"><div id="h1" class="col col-span-6 cell"></div><div id="h2" class="col col-span-6 cell"></div></div>`)
  width('equal', 616)
  for (const id of ['e1', 'e2', 'e3']) width(id, 616 / 3)
  width('h1', 308)
  width('h2', 308)
  expect(rect('h1').top).toBe(rect('h2').top)
  expect(rect('h2').right).toBeCloseTo(rect('halves').right, 1)
  expect(getComputedStyle(node('h1')).paddingLeft).toBe('8px')
  expect(rect('halves').left).toBe(24)
})

it('wrapped columns use vertical gutters and offsets and ordering retain geometry', () => {
  render(`<div id="wrap" class="row row-g-3"><div id="w1" class="col col-span-6 cell"></div><div class="col col-span-6 cell"></div><div id="w3" class="col col-span-6 cell"></div></div>
<div id="offset" class="row"><div id="o1" class="col col-span-4 col-offset-2 cell"></div></div>
<div class="row"><div id="last" class="col col-order-last cell"></div><div id="first" class="col col-order-first cell"></div></div>`)
  expect(rect('w3').top - rect('w1').bottom).toBe(16)
  expect(rect('o1').left - rect('offset').left).toBeCloseTo(100, 1)
  width('o1', 200)
  expect(rect('first').left).toBeLessThan(rect('last').left)
})

it('nested rows replace their inherited gutters independently', () => {
  render(`<div id="outer" class="row row-g-5"><div id="parent" class="col col-span-6"><div id="inner" class="row row-g-1"><div id="child" class="col col-span-6 cell"></div><div class="col col-span-6 cell"></div></div></div><div id="sibling" class="col col-span-6 cell"></div></div>`)
  expect(getComputedStyle(node('parent')).paddingLeft).toBe('24px')
  expect(getComputedStyle(node('sibling')).paddingLeft).toBe('24px')
  expect(getComputedStyle(node('child')).paddingLeft).toBe('2px')
  expect(getComputedStyle(node('inner')).marginLeft).toBe('-2px')
  width('inner', rect('parent').width - 48 + 4)
})

it('responsive column widths and gutters change at breakpoint boundaries', async () => {
  render(`<div id="responsive" class="row row-g-0 md:row-g-3 lg:row-g-5"><div id="r1" class="col col-span-12 md:col-span-6 lg:col-span-4 cell"></div><div id="r2" class="col col-span-12 md:col-span-6 lg:col-span-4 cell"></div></div>`)
  for (const [viewport, fraction, gutter] of [[767, 1, 0], [768, 0.5, 16], [1023, 0.5, 16], [1024, 1 / 3, 48]] as const) {
    await page.viewport(viewport, 768)
    width('responsive', 600 + gutter)
    width('r1', (600 + gutter) * fraction)
    expect(getComputedStyle(node('r1')).paddingLeft).toBe(`${gutter / 2}px`)
    expect(getComputedStyle(node('responsive')).rowGap).toBe(`${gutter}px`)
    if (fraction === 1)
      expect(rect('r2').top).toBeGreaterThan(rect('r1').top)
    else expect(rect('r2').top).toBe(rect('r1').top)
  }
})

it('slot and compound expansions preserve native shorthand and responsive ordering', async () => {
  render('<div id="compound" class="ordered ordered-active ordered-accent"><div id="slot" class="ordered__title"></div></div>')
  for (const [viewport, opacity] of [[767, '1'], [768, '0.5'], [1023, '0.5'], [1024, '0.75']] as const) {
    await page.viewport(viewport, 768)
    for (const id of ['compound', 'slot']) {
      const computed = getComputedStyle(node(id))
      expect(computed.paddingLeft).toBe('8px')
      expect(computed.paddingTop).toBe('16px')
      expect(computed.opacity).toBe(opacity)
    }
  }
})
