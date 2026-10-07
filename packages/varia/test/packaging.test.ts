import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, inject, it } from 'vitest'

it('installs the packed archive and loads its public exports without Tailwind', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'varia-isolated-'))
  try {
    const packageDir = join(dir, 'node_modules/variacss')
    const archive = inject('archive')
    await writeFile(join(dir, 'package.json'), '{"private":true,"type":"module"}')
    execFileSync('npm', ['install', '--ignore-scripts', '--omit=optional', '--no-audit', '--no-fund', archive], { cwd: dir, stdio: 'pipe' })
    const metadata = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8'))
    for (const entry of Object.values(metadata.exports) as (string | Record<string, string>)[]) {
      for (const path of typeof entry === 'string' ? [entry] : Object.values(entry))
        expect((await readFile(join(packageDir, path), 'utf8')).length).toBeGreaterThan(0)
    }
    expect(await readFile(join(packageDir, 'LICENSE'), 'utf8')).toContain('MIT License')
    for (const document of ['README.md', 'CHANGELOG.md'])
      expect((await readFile(join(packageDir, document), 'utf8')).length).toBeGreaterThan(0)
    expect(await readFile(join(packageDir, 'dist/tailwind.css'), 'utf8')).toContain('@layer theme, base, components, utilities;')
    const script = `
      import { defineComponent } from 'variacss';
      import { tailwindVaria } from 'variacss/tailwind';
      import assert from 'node:assert/strict';
      import { existsSync } from 'node:fs';
      import { fileURLToPath } from 'node:url';
      assert.equal(typeof defineComponent, 'function');
      assert.equal(existsSync(fileURLToPath(import.meta.resolve('variacss/tailwind.css'))), true);
      const component = defineComponent('card', {
        slots: { root: 'block', body: 'block' },
        variants: { active: { body: 'opacity-50' } },
        compoundVariants: [{ when: { active: true }, class: 'opacity-75' }],
      });
      const plugin = tailwindVaria({ components: [component] });
      console.log(component.rules.length, typeof plugin);
    `
    expect(execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: dir, encoding: 'utf8' }).trim()).toBe('4 object')
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
})
