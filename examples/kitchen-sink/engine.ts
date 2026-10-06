import type { PluginOption } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export function enginePlugin(): PluginOption {
  return tailwindcss()
}
