import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'

it('loads built definitions and the adapter without any CSS engine installed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'varia-isolated-'))
  try {
    await cp(new URL('../dist/', import.meta.url), join(dir, 'dist'), { recursive: true })
    const url = (file: string): string => JSON.stringify(pathToFileURL(join(dir, 'dist', file)).href)
    const script = `
      import { defineComponent } from ${url('index.mjs')};
      import { createAdapter } from ${url('adapter.mjs')};
      const component = defineComponent('card', {
        slots: { root: 'block', body: 'block' },
        variants: { active: { body: 'opacity-50' } },
        compoundVariants: [{ when: { active: true }, class: 'opacity-75' }],
      });
      const adapter = createAdapter({ components: [component], manifest: false });
      console.log(component.styles.length, typeof adapter);
    `
    expect(execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: dir, encoding: 'utf8' }).trim()).toBe('2 object')
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
})
