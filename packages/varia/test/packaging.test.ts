import { execFileSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'

it('loads public package exports without an engine and rejects the comparison alias', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'varia-isolated-'))
  try {
    const packageDir = join(dir, 'node_modules/varia')
    await mkdir(packageDir, { recursive: true })
    await cp(new URL('../dist/', import.meta.url), join(packageDir, 'dist'), { recursive: true })
    await cp(new URL('../package.json', import.meta.url), join(packageDir, 'package.json'))
    const script = `
      import { defineComponent } from 'varia';
      import { tailwindVaria } from 'varia/tailwind';
      import assert from 'node:assert/strict';
      import { existsSync } from 'node:fs';
      import { fileURLToPath } from 'node:url';
      assert.equal(typeof defineComponent, 'function');
      assert.equal(existsSync(fileURLToPath(import.meta.resolve('varia/tailwind.css'))), true);
      await assert.rejects(import('varia/adapter'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
      await assert.rejects(import('varia/types'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
      const component = defineComponent('card', {
        slots: { root: 'block', body: 'block' },
        variants: { active: { body: 'opacity-50' } },
        compoundVariants: [{ when: { active: true }, class: 'opacity-75' }],
      });
      const adapter = tailwindVaria({ components: [component], manifest: false });
      console.log(component.styles.length, typeof adapter);
    `
    expect(execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: dir, encoding: 'utf8' }).trim()).toBe('2 object')
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
})
