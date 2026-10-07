import type { ViteDevServer } from 'vite'
import { execFileSync, spawn } from 'node:child_process'
import { once } from 'node:events'
import { watch } from 'node:fs'
import { mkdir, mkdtemp, realpath, rm, symlink, unlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createLogger, createServer } from 'vite'
import { afterEach, expect, it } from 'vitest'
import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node.js'

const require = createRequire(import.meta.url)
const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const modules = join(packageRoot, 'node_modules')
const fixtures: string[] = []

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

interface Completion {
  label: string
  textEdit: { newText: string, range: { start: { character: number }, end: { character: number } } }
}

it.each([false, true])('completes and refreshes native Tailwind classes, monorepo=%s', async (monorepo) => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'varia-editor-')))
  fixtures.push(root)
  const app = monorepo ? join(root, 'apps/web') : root
  const recipes = monorepo ? join(root, 'packages/design') : join(root, 'recipes')
  const prefix = monorepo ? 'tw:' : ''
  const modifier = monorepo ? 'tablet' : 'md'
  await Promise.all([app, recipes].map(path => mkdir(path, { recursive: true })))
  const packageDir = join(root, 'node_modules/varia')
  await mkdir(packageDir, { recursive: true })
  execFileSync('pnpm', ['pack', '--out', join(root, 'varia.tgz')], { cwd: packageRoot, stdio: 'pipe' })
  execFileSync('tar', ['-xzf', join(root, 'varia.tgz'), '-C', packageDir, '--strip-components=1'])
  for (const name of ['tailwindcss', 'vite', '@tailwindcss/vite']) {
    const target = join(root, 'node_modules', name)
    await mkdir(dirname(target), { recursive: true })
    const source = name === '@tailwindcss/vite' ? fileURLToPath(new URL('../../../examples/kitchen-sink/node_modules/', import.meta.url)) : modules
    await symlink(await realpath(join(source, name)), target, 'dir')
  }
  await writeFile(join(root, 'package.json'), '{"type":"module","private":true}')
  const recipe = join(recipes, 'probe.ts')
  const tokens = join(recipes, 'tokens.ts')
  const config = join(app, 'tailwind.config.ts')
  const extra = join(recipes, 'extra.ts')
  const importPath = (path: string) => `./${relative(app, path).replaceAll('\\', '/')}`
  const writeRecipe = (variant: string) => writeFile(recipe, `import { defineComponent } from 'varia';
import { base } from './tokens.ts';
export default defineComponent('editor-probe', { slots: { root: base, title: 'font-bold' }, variants: { ${variant}: 'opacity-75' } });`)
  const writeConfig = (added = false) => writeFile(config, `import { tailwindVaria } from 'varia/tailwind';
import probe from ${JSON.stringify(importPath(recipe))};
${added ? `import extra from ${JSON.stringify(importPath(extra))};` : ''}
export default tailwindVaria({ components: [probe${added ? ', extra' : ''}], manifest: false${prefix ? ', prefix: \'tw\'' : ''} });`)
  await writeFile(tokens, 'export const base = "opacity-50";')
  await writeRecipe('active')
  await writeConfig()
  const stylesheet = join(app, 'styles.css')
  await writeFile(stylesheet, '@import "varia/tailwind.css";\n@import "tailwindcss";\n@theme { --breakpoint-tablet: 50rem; }\n@plugin "./tailwind.config.ts";')
  await writeFile(join(app, 'vite.config.ts'), `import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { utimesSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import './tailwind.config.ts';
export default defineConfig(({ command }) => {
  if (command === 'serve') {
    const now = new Date();
    utimesSync(fileURLToPath(new URL('./styles.css', import.meta.url)), now, now);
  }
  return { plugins: [tailwindcss()], server: { warmup: { clientFiles: ['./styles.css'] } } };
});`)
  let text = `<div class="${prefix}editor-"></div>`
  let version = 1
  let uri = pathToFileURL(join(app, 'index.html')).href
  await writeFile(join(app, 'index.html'), text)
  const child = spawn(process.execPath, [require.resolve('@tailwindcss/language-server/bin/tailwindcss-language-server'), '--stdio'], { cwd: root, stdio: 'pipe' })
  const exited = once(child, 'exit')
  const connection = createMessageConnection(new StreamMessageReader(child.stdout), new StreamMessageWriter(child.stdin))
  const logs: string[] = []
  const watchPatterns: string[] = []
  child.stderr.on('data', data => logs.push(String(data)))
  connection.onNotification('window/logMessage', (event: { message: string }) => logs.push(event.message))
  connection.onRequest('workspace/configuration', (params: { items: { section: string }[] }) => params.items.map(item => item.section === 'tailwindCSS' ? { classFunctions: ['clsx'] } : {}))
  connection.onRequest('client/registerCapability', (params: { registrations: { method: string, registerOptions?: { watchers?: { globPattern: string }[] } }[] }) => {
    for (const registration of params.registrations) {
      if (registration.method === 'workspace/didChangeWatchedFiles')
        watchPatterns.push(...(registration.registerOptions?.watchers ?? []).map(watcher => watcher.globPattern))
    }
    return null
  })
  connection.onRequest('client/unregisterCapability', () => null)
  connection.listen()
  let vite: ViteDevServer | undefined
  const watchers: ReturnType<typeof watch>[] = []
  try {
    const rootUri = pathToFileURL(root).href
    await connection.sendRequest('initialize', {
      processId: process.pid,
      rootUri,
      workspaceFolders: [{ name: 'consumer', uri: rootUri }],
      capabilities: {
        workspace: { configuration: true, workspaceFolders: true, didChangeWatchedFiles: { dynamicRegistration: true } },
        textDocument: { completion: { dynamicRegistration: true }, hover: { dynamicRegistration: true } },
      },
    })
    await connection.sendNotification('initialized', {})
    await connection.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'html', version: 1, text } })
    const complete = async () => {
      const result = await connection.sendRequest<{ items: Completion[] } | null>('textDocument/completion', {
        textDocument: { uri },
        position: { line: 0, character: text.lastIndexOf('editor-') + 7 },
      })
      return result?.items ?? []
    }
    const names = async () => (await complete()).map(item => item.label)
    const changeText = async (value: string) => {
      text = value
      await connection.sendNotification('textDocument/didChange', { textDocument: { uri, version: ++version }, contentChanges: [{ text }] })
    }
    const hover = () => connection.sendRequest('textDocument/hover', { textDocument: { uri }, position: { line: 0, character: text.indexOf('editor-probe') + 2 } })
    await expect.poll(names, { timeout: 15_000 }).toContain('editor-probe')
    expect(await names()).toContain('editor-probe-active')
    expect(await names()).toContain('editor-probe__title')
    await changeText(`<div class="${prefix}${modifier}:editor-"></div>`)
    const completion = (await complete()).find(item => item.label === 'editor-probe')!
    const edit = completion.textEdit
    expect(text.slice(0, edit.range.start.character) + edit.newText + text.slice(edit.range.end.character)).toBe(`<div class="${prefix}${modifier}:editor-probe"></div>`)
    await changeText(`<div class="${prefix}${modifier}:editor-probe"></div>`)
    expect(JSON.stringify(await hover())).toContain('opacity: 50%')
    expect(JSON.stringify(await hover())).toContain('@media')
    if (monorepo)
      expect(JSON.stringify(await hover())).toContain('50rem')

    // Simulate VS Code's registered CSS watcher, not an invented recipe event.
    for (const file of [stylesheet, config]) {
      expect(watchPatterns).toContain(file)
      watchers.push(watch(file, () => {
        void connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri: pathToFileURL(file).href, type: 2 }] })
      }))
    }
    const logger = createLogger('silent')
    logger.error = message => logs.push(message)
    vite = await createServer({ root: app, configFile: join(app, 'vite.config.ts'), customLogger: logger, server: { host: '127.0.0.1', port: 0 } })
    await vite.listen()

    await writeFile(tokens, 'export const base = "opacity-25";')
    await expect.poll(async () => JSON.stringify(await hover()), { timeout: 10_000 }).toContain('opacity: 25%')
    await changeText(`<div class="${prefix}editor-"></div>`)
    await writeRecipe('selected')
    await expect.poll(names, { timeout: 10_000 }).toContain('editor-probe-selected')
    expect(await names()).not.toContain('editor-probe-active')

    await writeFile(extra, `import { defineComponent } from 'varia'; export default defineComponent('editor-added', { base: 'block' });`)
    await writeConfig(true)
    await expect.poll(names, { timeout: 10_000 }).toContain('editor-added')
    await writeConfig(false)
    await expect.poll(names, { timeout: 10_000 }).not.toContain('editor-added')
    await unlink(extra)

    await connection.sendNotification('textDocument/didClose', { textDocument: { uri } })
    uri = pathToFileURL(join(app, 'consumer.tsx')).href
    text = `<div className="${prefix}editor-" />; clsx('${prefix}editor-');`
    await connection.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'typescriptreact', version: 1, text } })
    await expect.poll(names, { timeout: 10_000 }).toContain('editor-probe-selected')
    const jsx = await connection.sendRequest<{ items: Completion[] }>('textDocument/completion', { textDocument: { uri }, position: { line: 0, character: text.indexOf('editor-') + 7 } })
    expect(jsx.items.map(item => item.label)).toContain('editor-probe__title')

    await writeFile(config, 'throw new Error("Invalid editor registration");')
    await expect.poll(() => logs.join('\n'), { timeout: 10_000 }).toContain('Unable to load plugin: ./tailwind.config.ts')
    await expect.poll(() => logs.join('\n'), { timeout: 10_000 }).toContain('Invalid editor registration')
    await expect.poll(names, { timeout: 10_000 }).not.toContain('editor-probe')
    await writeConfig()
    await expect.poll(names, { timeout: 10_000 }).toContain('editor-probe-selected')
  }
  catch (error) {
    throw new Error(logs.join('\n'), { cause: error })
  }
  finally {
    watchers.forEach(watcher => watcher.close())
    await vite?.close()
    connection.dispose()
    child.kill()
    await exited
  }
})
