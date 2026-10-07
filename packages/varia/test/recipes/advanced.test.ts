import { describe, expect, it } from 'vitest'
import accordion from '../../../../recipes/accordion.config.js'
import progress from '../../../../recipes/progress.config.js'
import tooltip from '../../../../recipes/tooltip.config.js'
import { generateCSS as generateRecipeCSS } from '../helpers/tailwind.js'

describe('advanced recipes', () => {
  it('preserves tooltip reveal attributes and the ancestor hover selector', async () => {
    const css = await generateRecipeCSS([tooltip], 'tooltip tooltip__bubble')
    expect(css).toMatch(/\.tooltip__bubble\[data-reveal="hover"\]\{[^}]*opacity:0;/)
    expect(css).toMatch(/\.tooltip__bubble\[data-reveal="hover"\]:is\(:where\(\.group\):hover \*\)\{[^}]*opacity:1;/)
    expect(css).toMatch(/\.tooltip__bubble\[data-reveal="always"\]\{[^}]*opacity:1;/)
  })

  it('preserves inherited progress values and root-to-bar variants', async () => {
    const css = await generateRecipeCSS([progress], 'progress progress__bar progress-c-success progress-striped')
    expect(css).toMatch(/\.progress__bar\{[^}]*width:var\(--progress,\s*0%\);/)
    expect(css).toMatch(/\.progress-c-success \.progress__bar\{[^}]*background-color:var\(--color-emerald-600\);/)
    expect(css).toMatch(/\.progress-striped \.progress__bar\{[^}]*background-image:linear-gradient\(/)
    expect(css).not.toContain('.progress-c-danger')
  })

  it('preserves native details marker suppression and open-state caret selectors', async () => {
    const css = await generateRecipeCSS([accordion], 'accordion accordion__trigger accordion__caret')
    expect(css).toMatch(/\.accordion__trigger::marker\{[^}]*display:none;/)
    expect(css).toMatch(/\.accordion__trigger::-webkit-details-marker\{[^}]*display:none;/)
    expect(css).toMatch(/details\[open\] \.accordion__caret\{[^}]*rotate:180deg;/)
  })
})
