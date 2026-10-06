import { execFileSync } from 'node:child_process'

const baseline = 'comparison-base'
const branches = ['tailwind-mvp', 'unocss-minimal']
const allowed = new Set([
  'examples/kitchen-sink/engine.ts',
  'examples/kitchen-sink/package.json',
  'examples/kitchen-sink/styles.css',
  'examples/kitchen-sink/tailwind.config.ts',
  'examples/kitchen-sink/uno.config.ts',
  'packages/varia/package.json',
  'packages/varia/src/adapter.ts',
  'packages/varia/src/tailwind.ts',
  'packages/varia/src/tailwind.css',
  'packages/varia/src/unocss.ts',
  'packages/varia/test/_engine.ts',
  'packages/varia/test/_tailwind.ts',
  'packages/varia/test/fixtures/engine.config.ts',
  'packages/varia/test/tailwind.test.ts',
  'packages/varia/test/unocss.test.ts',
  'packages/varia/tsdown.config.ts',
  'pnpm-lock.yaml',
])
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

for (const branch of branches) {
  const changes = git('diff', '--name-only', baseline, branch).split('\n').filter(Boolean)
  const drift = changes.filter(path => !allowed.has(path))
  if (drift.length)
    throw new Error(`${branch} differs from the common baseline outside engine integration:\n${drift.join('\n')}`)
  const otherEngine = branch === 'tailwind-mvp' ? 'unocss' : 'tailwind'
  const files = git('ls-tree', '-r', '--name-only', branch).split('\n')
  if (files.includes(`packages/varia/src/${otherEngine}.ts`))
    throw new Error(`${branch} still contains the other engine's adapter.`)
  const manifest = JSON.parse(git('show', `${branch}:packages/varia/package.json`))
  const deps = [...Object.keys(manifest.peerDependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})]
  if (deps.some(name => otherEngine === 'tailwind' ? name.includes('tailwindcss') : name.startsWith('@unocss/')))
    throw new Error(`${branch} still depends on the other CSS engine.`)
  console.log(`${branch}: shared files match; one CSS engine; ${changes.length} integration files differ.`)
}
if (git('merge-base', ...branches) !== git('rev-parse', baseline))
  throw new Error('The implementation branches must share comparison-base as their merge base.')
console.log('Comparison branches match the common baseline.')
