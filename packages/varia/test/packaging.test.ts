import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

it('loads public package exports without an engine and rejects the comparison alias', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'varia-isolated-'))
  try {
    const packageDir = join(dir, 'node_modules/variacss')
    const archive = process.env.VARIA_RELEASE_ARCHIVE ?? join(dir, JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', dir], {
      cwd: fileURLToPath(new URL('../', import.meta.url)),
      encoding: 'utf8',
    }))[0].filename)
    await writeFile(join(dir, 'package.json'), '{"private":true,"type":"module"}')
    execFileSync('npm', ['install', '--ignore-scripts', '--omit=optional', '--no-audit', '--no-fund', archive], { cwd: dir, stdio: 'pipe' })
    const metadata = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8'))
    for (const entry of Object.values(metadata.exports) as (string | Record<string, string>)[]) {
      for (const path of typeof entry === 'string' ? [entry] : Object.values(entry))
        expect((await readFile(join(packageDir, path), 'utf8')).length).toBeGreaterThan(0)
    }
    expect(metadata.exports).not.toHaveProperty('./types')
    await expect(readFile(join(packageDir, 'dist/types.d.mts'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await readFile(join(packageDir, 'LICENSE'), 'utf8')).toContain('MIT License')
    for (const document of ['README.md', 'API.md', 'CHANGELOG.md'])
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
      await assert.rejects(import('variacss/adapter'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
      await assert.rejects(import('variacss/types'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
      const component = defineComponent('card', {
        slots: { root: 'block', body: 'block' },
        variants: { active: { body: 'opacity-50' } },
        compoundVariants: [{ when: { active: true }, class: 'opacity-75' }],
      });
      const adapter = tailwindVaria({ components: [component] });
      console.log(component.styles.length, typeof adapter);
    `
    expect(execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: dir, encoding: 'utf8' }).trim()).toBe('2 object')
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
})
