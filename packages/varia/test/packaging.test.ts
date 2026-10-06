import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'

it('loads built definitions and both adapters without any CSS engine installed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'varia-isolated-'))
  try {
    await cp(new URL('../dist/', import.meta.url), join(dir, 'dist'), { recursive: true })
    const url = (file: string): string => JSON.stringify(pathToFileURL(join(dir, 'dist', file)).href)
    const script = `
      import { defineComponent } from ${url('index.mjs')};
      import { tailwindVaria } from ${url('tailwind.mjs')};
      import { presetVaria } from ${url('unocss.mjs')};
      const component = defineComponent('card', {
        slots: { root: 'block', body: 'block' },
        variants: { active: { body: 'opacity-50' } },
        compoundVariants: [{ when: { active: true }, class: 'opacity-75' }],
      });
      const plugin = tailwindVaria({ components: [component], manifest: false });
      const preset = presetVaria({ components: [component], manifest: false });
      console.log(component.styles.length, typeof plugin.handler, preset.shortcuts.length);
    `
    expect(execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: dir, encoding: 'utf8' }).trim()).toBe('2 function 3')
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
})
