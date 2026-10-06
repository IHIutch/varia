import type { Adapter } from './_adapters.js'

function selectEngine(): never {
  throw new Error('Run the integration suite on tailwind-mvp or unocss-minimal.')
}

export const adapter: Adapter = {
  name: 'baseline',
  generate: selectEngine,
  apply: selectEngine,
  register: selectEngine,
  registerWithoutLayers: selectEngine,
  packaged: selectEngine,
  important: selectEngine,
  prefixed: selectEngine,
}
