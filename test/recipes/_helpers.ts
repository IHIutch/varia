import type { DefinedComponent } from '../../src/index.js'
import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { presetVaria } from '../../src/preset.js'

export async function generateRecipeCSS(
  components: DefinedComponent[],
  classes: string,
): Promise<string> {
  const uno = await createGenerator({
    presets: [presetWind4(), presetVaria({ components, manifest: false })],
  })
  const { css } = await uno.generate(classes)
  return css
}
