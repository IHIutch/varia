import type { PreflightContext, Rule } from '@unocss/core'
import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import { presetVaria } from '../src/preset.js'

import button from '../recipes/button.config.js'
import card from '../recipes/card.config.js'
import formInput from '../recipes/form-input.config.js'
import spinner from '../recipes/spinner.config.js'
import avatar from '../recipes/avatar.config.js'
import dropdownComponents from '../recipes/dropdown.config.js'
import modal from '../recipes/modal.config.js'

// --- Theming demo wiring -----------------------------------------------------
// The Theming docs page renders live previews of two patterns:
//   - Pattern 1 (color-as-class with per-component vars driven by palette)
//     lives entirely inside recipes/scheme-button.config.ts and needs no
//     extra wiring here. theme(colors.X.Y) inside the variant expansions
//     does the palette lookup at build time.
//
//   - Pattern 2 (two-tier semantic tokens + swap classes) needs three things:
//     1. A literal palette on :root, generated from theme.colors so adding
//        a color to the project's UnoCSS theme automatically extends the set.
//     2. color-scheme: light dark so light-dark() values flip automatically.
//     3. Swap classes (.varia-theme-{name}) that point semantic tokens at one
//        color's literals — emitted via UnoCSS rules so they're JIT'd.

const THEME_COLORS = ['primary', 'success', 'danger', 'warning', 'info', 'neutral'] as const
type ThemeColor = (typeof THEME_COLORS)[number]

// Maps each semantic color name to a tone in the project's UnoCSS palette.
// Swapping a project's palette (or extending it) just changes which tones
// the literals point at — no oklch values get hardcoded anywhere.
const TONES: Record<ThemeColor, string> = {
  primary: 'blue',
  success: 'emerald',
  danger: 'red',
  warning: 'amber',
  info: 'sky',
  neutral: 'gray',
}

type ColorScale = Record<string, string>

function literalPaletteCSS(context: PreflightContext<object>): string {
  // UnoCSS's Theme type from presetWind4 carries a `colors` field as
  // `Record<string, ColorScale>` at runtime, but the type surface is opaque
  // (`object`) at the preflight callsite. Narrow locally.
  const colors = (context.theme as { colors?: Record<string, ColorScale> }).colors ?? {}

  const decls = THEME_COLORS.flatMap((color) => {
    const c = colors[TONES[color]]
    if (!c) return []
    return [
      `  --varia-${color}-bg: light-dark(${c['600']}, ${c['500']});`,
      `  --varia-${color}-text: light-dark(${c['700']}, ${c['300']});`,
      `  --varia-${color}-bg-subtle: light-dark(${c['50']}, ${c['950']});`,
      `  --varia-${color}-bg-muted: light-dark(${c['100']}, ${c['900']});`,
      `  --varia-${color}-border: light-dark(${c['300']}, ${c['700']});`,
      `  --varia-${color}-contrast: ${color === 'warning' ? c['950'] : 'white'};`,
      `  --varia-${color}-focus-ring: ${c['500']};`,
    ]
  }).join('\n')

  return `:root {\n  color-scheme: light dark;\n${decls}\n}`
}

// Swap-class rule generator. Each .varia-theme-{name} class points the
// semantic tokens at one color's literal tokens. JIT'd by UnoCSS, so only
// the swap classes actually referenced in markup get emitted.
function swapClassRules(): Rule<object>[] {
  return THEME_COLORS.map((color) => [
    `varia-theme-${color}`,
    {
      '--varia-theme-bg': `var(--varia-${color}-bg)`,
      '--varia-theme-text': `var(--varia-${color}-text)`,
      '--varia-theme-bg-subtle': `var(--varia-${color}-bg-subtle)`,
      '--varia-theme-bg-muted': `var(--varia-${color}-bg-muted)`,
      '--varia-theme-border': `var(--varia-${color}-border)`,
      '--varia-theme-contrast': `var(--varia-${color}-contrast)`,
      '--varia-theme-focus-ring': `var(--varia-${color}-focus-ring)`,
    },
  ])
}

export default defineConfig({
  content: {
    // Recipe source files build classes via template-literal helpers; scanning
    // them surfaces the unresolved `${tone}` substring as a bogus theme lookup.
    // The shortcuts the recipes EMIT (via presetVaria) are first-class and
    // don't depend on content scanning, so excluding the source is safe.
    pipeline: {
      exclude: [/[\\/]recipes[\\/].*\.config\.ts$/],
    },
  },
  presets: [
    presetWind4(),
    presetVaria({
      components: [
        button,
        card,
        formInput,
        spinner,
        avatar,
        ...dropdownComponents,
        modal,
      ],
      manifest: false,
    }),
  ],
  rules: [...swapClassRules()],
  preflights: [
    {
      getCSS: literalPaletteCSS,
    },
  ],
})
