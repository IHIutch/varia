# Theming

Varia uses ordinary CSS classes, so theming can use explicit variant classes, CSS custom properties, or inherited theme tokens. Pick the pattern that meets your needs.

| Need | Pattern |
|---|---|
| Override a single component's color | CSS custom properties ([Avatar recipe](/recipes/avatar)) |
| Multiple colors × multiple shapes on a single component | The [Button recipe](/recipes/button): explicit `c` / `style` compound rules |
| Theme several components within a subtree | Shared semantic tokens and theme classes |
| Automatic dark mode across components | Semantic tokens with `light-dark()` values |

The Button recipe defines a rule for each color and style combination. For example, `btn-c-primary btn-style-solid` selects blue background and border utilities. Changing a color means editing the corresponding utility strings in its compound rules.

For a component that needs an individual override, expose CSS custom properties as the [Avatar recipe](/recipes/avatar) does. For a shared theme across components, the examples below use inherited semantic tokens and optional `light-dark()` values.

These are patterns you implement in your component definitions and UnoCSS config. Varia doesn't supply a built-in theme system. The palette preflight emits its full token block; the theme swap classes and component shortcuts are generated on demand.

## When explicit variants are enough

Explicit variants are enough when:

- Components can each select their own color.
- Dark mode is unnecessary or handled with UnoCSS's `dark:` prefix.
- Consumers override one component at a time.

Use classes such as `btn-c-primary btn-style-solid` on each button. No shared theme wrapper is needed.

For a single color override such as `--avatar-bg`, see the [Avatar recipe](/recipes/avatar).

## When you want cross-component reskinning

To apply one brand color across several components, a consumer might write:

```html
<form class="brand-primary">
  <input class="input" />
  <button class="btn btn-style-solid">Submit</button>
  <span class="badge">New</span>
</form>
```

A wrapper class has no effect unless the children read shared CSS variables. With explicit color variants, each child selects its own color, such as `btn-c-primary` or `badge-c-primary`.

Shared semantic tokens let children inherit a theme from the wrapper. This example adapts the pattern from Bootstrap's [theming refactor](https://github.com/twbs/bootstrap/pull/41789).

This pattern adds three layers:

1. Literal tokens store palette values on `:root`, such as `--varia-primary-bg` and `--varia-success-bg-subtle`.
2. Semantic tokens name component roles, such as `--varia-theme-bg`, `--varia-theme-text`, and `--varia-theme-border`.
3. Theme classes such as `.varia-theme-primary` assign the palette values to semantic tokens.

The themed components read semantic tokens rather than color-specific palette tokens.

### Step 1. Generate the literal palette from `theme.colors`

Use a UnoCSS preflight to generate the palette variables from the project's `theme.colors`.

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

`light-dark()` selects light or dark palette values, as described below.

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

Themed components read variables such as `var(--varia-theme-bg)`. Include `theme()` fallbacks for use outside a theme wrapper.

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

This definition has no color variant. The wrapper sets the color through CSS variables, and the button selects a style. Four style shortcuts can serve six wrapper colors without defining 24 color and style combinations.

The `theme(colors.gray.X)` fallbacks give the button neutral colors outside a theme wrapper.

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

Any component that reads the same tokens inherits the wrapper's theme, including badges, alerts, and inputs.

## Automatic dark mode with `light-dark()`

`light-dark()` is a CSS function that returns its first argument when `color-scheme` resolves to light and its second when it resolves to dark. The browser picks based on `prefers-color-scheme` and any `color-scheme` declaration in CSS.

Two requirements:

1. Set `color-scheme: light dark;` on `:root` (or on any ancestor of your themed content). This tells the browser the page supports both modes.
2. Write your literal-palette tokens with `light-dark()` for any value that should change between modes (already done in step 1).

With this setup, the themed components follow the user's system color preference without changes to their class names.

::: tip Browser support
`light-dark()` is supported in modern Chrome, Safari, and Firefox (2024+). For older baselines, add a `@media (prefers-color-scheme: dark)` block that overrides the literal tokens.
:::

## Anti-patterns

- Choose explicit variants or inherited semantic tokens for each component to avoid duplicate definitions.
- Expose variables for values consumers need to change. Unnecessary variables add CSS and make the configuration harder to follow.
- Keep variable fallbacks short. Nested chains such as `var(--a, var(--b, var(--c, ...)))` make it harder to identify the value in use.
- Set `color-scheme: light dark` when using `light-dark()` to follow the system preference.

## Inspiration and credit

The recipes use utility strings and ordinary CSS custom properties. The two-tier semantic-token model is adapted from Bootstrap v6's [theming refactor (#41789)](https://github.com/twbs/bootstrap/pull/41789). The semantic-color-names-with-remappable-tones approach mirrors [Nuxt UI's theming model](https://ui.nuxt.com/getting-started/theme). These examples show how to use those CSS patterns with Varia component definitions.

