# Theming

Theming has three levels. Pick the lowest one that meets your needs.

| Need | Pattern |
|---|---|
| One-off override of a single component's color | Per-component knob var ([Avatar recipe](/recipes/avatar)) |
| Multiple colors × multiple shapes on a single component | The default [Button recipe](/recipes/button): per-component CSS vars via `c` / `style` axes |
| Wrap a subtree and reskin every descendant | Two-tier semantic tokens + swap classes (this page, below) |
| Automatic dark mode across a multi-component library | Two-tier semantic tokens with `light-dark()` literals (this page, below) |

The default Button recipe is already a small theming system:

```ts
const TONES = { primary: 'blue', danger: 'red', /* ... */ }
//                          ^^^^                 ^^^
// Remapping a tone is one edit. Adding a new color is one more entry.
```

The `c` variant generates per-component CSS variables from the palette; the `style` variant consumes them. For most libraries that's enough.

This page covers the two patterns the default button doesn't handle:

1. Cross-component reskinning: one class on an ancestor that themes every descendant component simultaneously, the way Bootstrap v6, Radix Themes, and Nuxt UI do.
2. Automatic dark mode: `light-dark()` in your palette so toggling `prefers-color-scheme` flips every themed component with zero JS.

Both are docs-and-config patterns you adopt selectively.

## When you don't need either

If your library:

- Has fewer than ~10 components.
- Doesn't need dark mode (or handles it per-component via UnoCSS's `dark:` prefix).
- Lets consumers reskin one component at a time.

Then stick with the default pattern. `btn-c-primary btn-style-solid` on each button is more grep-able and easier to debug than wrapping subtrees, and the recipes ship in that shape.

For one-off knob overrides (a single `--avatar-bg` override in a CSS file), see the [Avatar recipe](/recipes/avatar). It shows the narrowest form of per-component theming.

## When you want cross-component reskinning

Imagine a consumer writes this:

```html
<form class="brand-primary">
  <input class="input" />
  <button class="btn btn-style-solid">Submit</button>
  <span class="badge">New</span>
</form>
```

...and expects every component inside to pick up the brand color. With per-component knobs, `brand-primary` does nothing; each component carries its own color class (`btn-c-primary`, `input-c-primary`, `badge-c-primary`). Adding the wrapper would mean threading the color into each child individually.

The answer is **two-tier semantic tokens**, adapted from Bootstrap v6's [theming refactor](https://github.com/twbs/bootstrap/pull/41789).

The model has three layers on top of the default recipe:

1. *Literal tokens* — color-specific variables on `:root`: `--varia-primary-bg`, `--varia-primary-text`, `--varia-success-bg-subtle`, etc. One set per color in your palette.
2. *Semantic tokens* — role-shaped variables set by swap classes: `--varia-theme-bg`, `--varia-theme-text`, `--varia-theme-border`, `--varia-theme-bg-subtle`, `--varia-theme-bg-muted`, `--varia-theme-contrast`, `--varia-theme-focus-ring`.
3. *Swap classes* — `.varia-theme-primary`, `.varia-theme-danger`, etc. Each writes the semantic tokens by pointing them at one color's literal tokens.

Components that opt in read *only* the semantic tokens. They never reference a literal directly.

### Step 1. Generate the literal palette from `theme.colors`

Emit the literal-token block via a UnoCSS preflight. Read values from the project's existing palette so adding a color to your UnoCSS theme automatically extends the set.

```ts
// unocss.config.ts (excerpt)
import { defineConfig } from 'unocss'

const THEME_COLORS = [
  'primary',
  'success',
  'danger',
  'warning',
  'info',
  'neutral'
] as const

const TONES = {
  primary: 'blue',
  success: 'emerald',
  danger: 'red',
  warning: 'amber',
  info: 'sky',
  neutral: 'gray',
}

export default defineConfig({
  preflights: [
    {
      getCSS: ({ theme }) => {
        const decls = THEME_COLORS.flatMap((color) => {
          const c = theme.colors[TONES[color]]
          return [
            `  --varia-${color}-bg:        light-dark(${c['600']}, ${c['500']});`,
            `  --varia-${color}-text:      light-dark(${c['700']}, ${c['300']});`,
            `  --varia-${color}-bg-subtle: light-dark(${c['50']},  ${c['950']});`,
            `  --varia-${color}-bg-muted:  light-dark(${c['100']}, ${c['900']});`,
            `  --varia-${color}-border:    light-dark(${c['300']}, ${c['700']});`,
            `  --varia-${color}-contrast:  white;`,
            `  --varia-${color}-focus-ring: ${c['500']};`,
          ]
        }).join('\n')
        return `:root {\n  color-scheme: light dark;\n${decls}\n}`
      },
    },
  ],
})
```

The `light-dark()` calls in each token are what enable automatic dark mode, covered below.

### Step 2. Define the swap classes

Each `.varia-theme-{name}` class points the semantic tokens at one color's literals. Emit them via UnoCSS `rules` for JIT compilation, so only the classes referenced in markup end up in the bundle.

```ts
// unocss.config.ts (continued)
const swapClassRules = THEME_COLORS.map(color => [
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

export default defineConfig({
  rules: swapClassRules,
  // ... preflights from step 1
})
```

### Step 3. Author components that consume semantic tokens

A component that wants to participate in wrapper-driven theming reads `var(--varia-theme-bg)`, `var(--varia-theme-text)`, etc., never the literal palette tokens. Include `theme()` fallbacks so the component still renders sensibly outside any swap class.

```ts
import { defineComponent } from 'varia'

// Each token is `var(--name, fallback)` so the component renders sensibly
// outside any `.varia-theme-*` wrapper. Pulled into consts to keep the
// expansion lines short.
const BG       = 'var(--varia-theme-bg,theme(colors.gray.500))'
const BG_MUTED = 'var(--varia-theme-bg-muted,theme(colors.gray.600))'
const BG_SUB   = 'var(--varia-theme-bg-subtle,theme(colors.gray.100))'
const TEXT     = 'var(--varia-theme-text,theme(colors.gray.700))'
const BORDER   = 'var(--varia-theme-border,theme(colors.gray.300))'
const CONTRAST = 'var(--varia-theme-contrast,white)'

export default defineComponent('themable-btn', {
  base: 'inline-flex items-center justify-center rounded-md font-medium border transition-colors',
  variants: {
    style: {
      solid:   `bg-[${BG}] text-[${CONTRAST}] border-[${BG}] hover:bg-[${BG_MUTED}]`,
      outline: `bg-transparent text-[${TEXT}] border-[${BORDER}] hover:bg-[${BG_SUB}]`,
      subtle:  `bg-[${BG_SUB}] text-[${TEXT}] border-transparent hover:bg-[${BG_MUTED}]`,
      ghost:   `bg-transparent text-[${TEXT}] border-transparent hover:bg-[${BG_SUB}]`,
    },
    s: { sm: 'px-2.5 py-1 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg' },
  },
})
```

Notice: no `c` (color) variant. Color comes from the outer `.varia-theme-*` wrapper, not from a per-button class. A 4-style × 6-color matrix that would cost 24 expansions on the default button costs 4 expansions on this one. The swap classes carry the color; the component carries the shape.

The `theme(colors.gray.X)` fallbacks matter: a `themable-btn` rendered outside any wrapper falls back to neutral gray rather than appearing broken.

### Consumption

Wrap a subtree in a swap class. Every themable component inside picks up the color:

```html
<div class="varia-theme-primary">
  <button class="themable-btn themable-btn-style-solid themable-btn-s-md">Save</button>
  <button class="themable-btn themable-btn-style-outline themable-btn-s-md">Cancel</button>
</div>

<div class="varia-theme-danger">
  <button class="themable-btn themable-btn-style-solid themable-btn-s-md">Delete</button>
</div>
```

A second component that also consumes the semantic tokens (a `themable-badge`, an `alert`, a `form-input`) reskins alongside the button without any per-component knobs.

## Automatic dark mode with `light-dark()`

`light-dark()` is a CSS function that returns its first argument when `color-scheme` resolves to light and its second when it resolves to dark. The browser picks based on `prefers-color-scheme` and any `color-scheme` declaration in CSS.

Two requirements:

1. Set `color-scheme: light dark;` on `:root` (or on any ancestor of your themed content). This tells the browser the page supports both modes.
2. Write your literal-palette tokens with `light-dark()` for any value that should change between modes (already done in step 1).

That's the entire dark-mode integration. Swap classes and component expansions stay unchanged; every themed component flips automatically when the user toggles their system preference.

::: tip Browser support
`light-dark()` is supported in modern Chrome, Safari, and Firefox (2024+). For older baselines, add a `@media (prefers-color-scheme: dark)` block that overrides the literal tokens.
:::

## Anti-patterns

- Don't author every component twice (once for per-component vars, once for semantic tokens). Pick the layer each component participates in and commit to it.
- Don't expose every utility as a var. Token soup makes APIs harder to reason about and bloats CSS.
- Don't chain `var(--a, var(--b, var(--c, ...)))` deeper than one hop. Multi-hop fallback chains make debugging painful.
- Don't forget `color-scheme: light dark` if you use `light-dark()`. Without it, browsers may render in light mode forever on dark-OS systems.

## Inspiration and credit

The patterns documented here are not novel. The defaults draw from Tailwind's utility model and Radix Themes' per-component CSS variables. The two-tier semantic-token model is adapted from Bootstrap v6's [theming refactor (#41789)](https://github.com/twbs/bootstrap/pull/41789). The semantic-color-names-with-remappable-tones approach mirrors [Nuxt UI's theming model](https://ui.nuxt.com/getting-started/theme). `varia` takes the best parts of each: explicit color in markup (Tailwind/Radix), Bootstrap's wrapper reskinning for libraries that grow large, and Nuxt UI's remappable defaults for consumer-side customization.

