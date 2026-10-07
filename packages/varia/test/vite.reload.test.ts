import type { Browser } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, realpath, rm, symlink, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createLogger, createServer } from 'vite'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

const exampleModules = fileURLToPath(new URL('../../../examples/kitchen-sink/node_modules/', import.meta.url))
const packageRoot = fileURLToPath(new URL('../', import.meta.url))
let archiveDir: string
let archive: string
let browser: Browser
const fixtures: string[] = []

beforeAll(async () => {
  archiveDir = await realpath(await mkdtemp(join(tmpdir(), 'varia-reload-pack-')))
  archive = join(archiveDir, 'varia.tgz')
  execFileSync('pnpm', ['pack', '--out', archive], { cwd: packageRoot, stdio: 'pipe' })
  browser = await chromium.launch({ headless: true })
})

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map(path => rm(path, { recursive: true, force: true })))
})

afterAll(async () => {
  await browser?.close()
  if (archiveDir)
    await rm(archiveDir, { recursive: true, force: true })
})

const importPath = (from: string, to: string) => `./${relative(from, to).replaceAll('\\', '/')}`

async function fixture(monorepo: boolean) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'varia-reload-consumer-')))
  fixtures.push(root)
  const app = monorepo ? join(root, 'apps/web') : root
  const recipes = monorepo ? join(root, 'packages/design/recipes') : join(root, 'recipes')
  const helpers = monorepo ? join(root, 'packages/design/helpers') : join(root, 'helpers')
  const packageDir = join(root, 'node_modules/variacss')
  const prefix = monorepo ? 'tw' : ''
  const cls = (value: string) => prefix ? `${prefix}:${value}` : value
  await Promise.all([app, recipes, helpers, packageDir].map(path => mkdir(path, { recursive: true })))
  execFileSync('tar', ['-xzf', archive, '-C', packageDir, '--strip-components=1'])
  for (const dependency of ['vite', 'tailwindcss', '@tailwindcss/vite']) {
    const dest = join(root, 'node_modules', dependency)
    await mkdir(dirname(dest), { recursive: true })
    await symlink(await realpath(join(exampleModules, dependency)), dest, 'dir')
  }
  await writeFile(join(root, 'package.json'), '{"type":"module","private":true}')
  const tokens = join(helpers, 'tokens.ts')
  const recipe = join(recipes, 'probe.ts')
  const writeRecipe = (axis: string) => writeFile(recipe, `import { defineComponent } from 'variacss';
import { base } from ${JSON.stringify(importPath(recipes, tokens))};
export default defineComponent('reload-probe', { base, variants: { ${axis}: 'block' } });`)
  await writeFile(tokens, 'export const base = \'opacity-50\';')
  await writeRecipe('old')
  const config = join(app, 'tailwind.config.ts')
  const writeConfig = (added = false) => writeFile(config, `import { tailwindVaria } from 'variacss/tailwind';
import probe from ${JSON.stringify(importPath(app, recipe))};
${added ? `import extra from ${JSON.stringify(importPath(app, join(recipes, 'extra.ts')))};` : ''}
export default tailwindVaria({ components: [probe${added ? ', extra' : ''}], prefix: ${JSON.stringify(prefix || undefined)} });`)
  await writeConfig()
  await writeFile(join(app, 'styles.css'), `@import "variacss/tailwind.css";
@import "tailwindcss" source(none);
@source inline("${['reload-probe', 'reload-probe-old', 'reload-probe-new', 'reload-added'].map(cls).join(' ')}");
@plugin "./tailwind.config.ts";`)
  await writeFile(join(app, 'index.html'), `<div id="probe" class="${cls('reload-probe')} ${cls('reload-probe-old')} ${cls('reload-probe-new')}">Probe</div><div id="extra" class="${cls('reload-added')}">Extra</div><script type="module" src="/main.ts"></script>`)
  await writeFile(join(app, 'main.ts'), 'import \'./styles.css\';')
  await writeFile(join(app, 'vite.config.ts'), `import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import './tailwind.config.ts';
export default defineConfig({ plugins: [tailwindcss()], server: { warmup: { clientFiles: ['./styles.css'] } } });`)
  const logs: string[] = []
  const logger = createLogger('silent')
  const error = logger.error.bind(logger)
  logger.error = (message, options) => {
    logs.push(message)
    error(message, options)
  }
  const info = logger.info.bind(logger)
  logger.info = (message, options) => {
    logs.push(message)
    info(message, options)
  }
  const server = await createServer({ root: app, configFile: join(app, 'vite.config.ts'), customLogger: logger, server: { host: '127.0.0.1', port: 0 } })
  const page = await browser.newPage()
  try {
    await server.listen()
    const origin = server.resolvedUrls!.local[0]!
    await page.goto(origin)
    const opacity = () => page.locator('#probe').evaluate(element => getComputedStyle(element).opacity)
    await expect.poll(opacity, { timeout: 10_000 }).toBe('0.5')
    return { root, app, recipes, tokens, cls, server, origin, page, logs, opacity, writeRecipe, writeConfig }
  }
  catch (error) {
    await page.close()
    await server.close()
    await rm(root, { recursive: true, force: true })
    throw error
  }
}

async function servedCss(origin: string): Promise<string> {
  const response = await fetch(new URL('styles.css?direct', origin))
  if (!response.ok)
    throw new Error(`CSS returned ${response.status}`)
  return response.text()
}

describe('native Vite recipe reload', () => {
  it.each([false, true])('reloads imported recipes and recovers without manual restart, monorepo=%s', async (monorepo) => {
    const f = await fixture(monorepo)
    try {
      // Vite tracks the imported configuration and its transitive dependencies.
      await writeFile(f.tokens, 'export const base = \'opacity-75\';')
      await expect.poll(f.opacity, { timeout: 10_000 }).toBe('0.75')
      await f.writeRecipe('new')
      await expect.poll(() => servedCss(f.origin), { timeout: 10_000 }).toContain(`.${f.cls('reload-probe-new').replaceAll(':', '\\:')}`)
      expect(await servedCss(f.origin)).not.toContain(`.${f.cls('reload-probe-old').replaceAll(':', '\\:')}`)

      const extra = join(f.recipes, 'extra.ts')
      await writeFile(extra, `import { defineComponent } from 'variacss'; export default defineComponent('reload-added', { base: 'opacity-25' });`)
      await f.writeConfig(true)
      await expect.poll(() => f.page.locator('#extra').evaluate(element => getComputedStyle(element).opacity), { timeout: 10_000 }).toBe('0.25')

      await f.writeConfig(false)
      await unlink(extra)
      await expect.poll(async () => {
        try {
          const css = await servedCss(f.origin)
          return css.includes('reload-probe')
            && !css.includes(f.cls('reload-added').replaceAll(':', '\\:'))
            && !css.includes(f.cls('reload-probe-old').replaceAll(':', '\\:'))
        }
        catch {
          // Configuration restarts temporarily close the HTTP connection.
          return false
        }
      }, { timeout: 10_000 }).toBe(true)

      // Invalid definitions fail configuration loading; fixing the import recovers.
      await writeFile(f.tokens, 'export const base = \'\';')
      await expect.poll(() => f.logs.join('\n'), { timeout: 10_000 }).toContain('Empty expansion for "reload-probe"')
      await writeFile(f.tokens, 'export const base = \'opacity-25\';')
      await expect.poll(f.opacity, { timeout: 10_000 }).toBe('0.25')

      const restarts = () => f.logs.filter(message => message.includes('server restarted.')).length
      const idleCount = restarts()
      await new Promise(resolve => setTimeout(resolve, 500))
      expect(restarts()).toBe(idleCount)
    }
    finally {
      await f.page.close()
      await f.server.close()
      await rm(f.root, { recursive: true, force: true })
    }
  })
})
