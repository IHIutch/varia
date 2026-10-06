import css from 'virtual:varia-browser-css'
import { beforeEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

const style = document.createElement('style')
style.textContent = `
@layer fixture-reset {
  * { box-sizing: border-box; }
  body { margin: 0; font: 16px/1.5 Arial, sans-serif; color: #111827; background: white; }
  button, input { margin: 0; padding: 0; font: inherit; border-style: solid; background: transparent; }
  a { text-decoration: none; }
  ul { margin: 0; padding: 0; list-style: none; }
}
${css}
#fixture { width: 640px; padding: 24px; background: white; }
.row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
h2 { margin: 0 0 16px; font: bold 16px/1.5 Arial, sans-serif; }
*, *::before, *::after { animation: none !important; transition: none !important; }
`
document.head.append(style)

beforeEach(async () => {
  document.body.innerHTML = '<main id="fixture" data-testid="fixture"></main>'
  await page.viewport(1024, 768)
})

function render(markup: string): HTMLElement {
  const fixture = document.querySelector<HTMLElement>('#fixture')!
  fixture.innerHTML = markup
  return fixture
}

function element(id: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!
}

function color(node: HTMLElement, property = 'color'): number[] {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  context.fillStyle = getComputedStyle(node).getPropertyValue(property)
  context.fillRect(0, 0, 1, 1)
  return [...context.getImageData(0, 0, 1, 1).data]
}

async function screenshot(name: string): Promise<void> {
  await document.fonts.ready
  await expect(page.getByTestId('fixture')).toMatchScreenshot(name)
}

it('button compounds, disabled state, and utility overrides', async () => {
  render(`<h2>Buttons</h2><div class="row">
    <button data-testid="solid" class="btn btn-c-primary btn-style-solid btn-s-md">Save</button>
    <button class="btn btn-c-primary btn-style-outline btn-s-md">Cancel</button>
    <button data-testid="disabled" disabled class="btn btn-c-primary btn-style-solid btn-s-md">Disabled</button>
  </div><div class="row">
    <button data-testid="square" class="icon-btn icon-btn-s-md icon-btn-square">+</button>
    <button data-testid="override" class="btn btn-c-primary btn-style-solid btn-s-md text-red-600">Utility override</button>
  </div>`)
  expect(getComputedStyle(element('square')).padding).toBe('8px')
  expect(getComputedStyle(element('disabled')).opacity).toBe('0.5')
  expect(color(element('solid'), 'background-color')).toEqual([21, 93, 252, 255])
  expect(color(element('override'))).toEqual([231, 0, 11, 255])
  await screenshot('buttons')
})

it('input groups preserve outer corners and square inner corners', async () => {
  render(`<h2>Input group</h2><div class="input-group">
    <span data-testid="first" class="input-group__addon">https://</span>
    <input data-testid="middle" class="form-input form-input-s-md form-input-state-default" value="example.com">
    <button data-testid="last" class="btn btn-c-primary btn-style-solid btn-s-md">Go</button>
  </div>`)
  expect(getComputedStyle(element('first')).borderTopLeftRadius).toBe('6px')
  expect(getComputedStyle(element('first')).borderTopRightRadius).toBe('0px')
  expect(getComputedStyle(element('middle')).borderRadius).toBe('0px')
  expect(getComputedStyle(element('last')).borderTopLeftRadius).toBe('0px')
  expect(getComputedStyle(element('last')).borderTopRightRadius).toBe('6px')
  expect(getComputedStyle(element('last')).marginLeft).toBe('-1px')
  await screenshot('input-group')
})

it('nav tabs and pills preserve active and disabled styles', async () => {
  const links = `<li class="nav__item"><a class="nav__link nav__link-active">Overview</a></li>
    <li class="nav__item"><a class="nav__link">Reviews</a></li>
    <li class="nav__item"><a data-testid="disabled" class="nav__link nav__link-disabled">Archived</a></li>`
  render(`<h2>Navigation</h2><ul class="nav nav-style-tabs">${links}</ul>
    <ul style="margin-top:24px" class="nav nav-style-pills">${links}</ul>`)
  expect(getComputedStyle(element('disabled')).pointerEvents).toBe('none')
  const active = document.querySelectorAll<HTMLElement>('.nav__link-active')
  expect(color(active[0]!)).toEqual([16, 24, 40, 255])
  expect(color(active[1]!)).toEqual([255, 255, 255, 255])
  await screenshot('navigation')
})

it('dropdown activation targets its menu slot and preserves data states', async () => {
  render(`<h2>Dropdown</h2><div style="height:160px;width:240px" class="dropdown dropdown-align-end">
    <button class="dropdown__trigger">Actions</button>
    <div data-testid="menu" class="dropdown__menu">
      <a class="dropdown__item">Edit</a><a class="dropdown__item" data-variant="danger">Delete</a>
    </div>
  </div>`)
  expect(getComputedStyle(element('menu')).display).toBe('none')
  element('menu').dataset.state = 'open'
  expect(getComputedStyle(element('menu')).display).toBe('block')
  expect(getComputedStyle(element('menu')).right).toBe('0px')
  await screenshot('dropdown-open')
})

it('usage-site hover acts on the activation element and definition focus acts on its slot', async () => {
  render(`<h2>Slot states</h2><div data-testid="activation" class="probe hover:probe-active">
    <span data-testid="slot" tabindex="0" class="probe__title">Focusable title</span>
  </div>`)
  await page.getByTestId('fixture').hover({ position: { x: 1, y: 1 } })
  expect(getComputedStyle(element('slot')).opacity).toBe('1')
  await page.getByTestId('activation').hover()
  expect(getComputedStyle(element('slot')).opacity).toBe('0.5')
  await screenshot('slot-hover')
  await page.getByTestId('slot').click()
  expect(getComputedStyle(element('slot')).opacity).toBe('0.75')
  await screenshot('slot-focus')
})

it('responsive slot variants and ordinary utilities retain precedence', async () => {
  render(`<h2>Responsive slots</h2><div class="probe md:probe-active">
    <span data-testid="slot" class="probe__title">Title</span>
  </div><div data-testid="compound" class="probe probe-active probe-accent opacity-100">Utility wins</div>`)
  await page.viewport(375, 768)
  expect(getComputedStyle(element('slot')).opacity).toBe('1')
  await page.viewport(1024, 768)
  expect(getComputedStyle(element('slot')).opacity).toBe('0.5')
  expect(getComputedStyle(element('compound')).opacity).toBe('1')
  await screenshot('responsive-and-precedence')
})
