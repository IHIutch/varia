import type { Plugin } from 'vite'

export function enginePlugin(): Plugin {
  throw new Error('Select tailwind-mvp or unocss-minimal to run the demo.')
}
