# Troubleshooting

## Unexpected variant precedence

Import `varia/tailwind.css` before Tailwind. Layer order must exist before any generated component rule:

```css
@import "varia/tailwind.css";
@import "tailwindcss";
@plugin "./varia.config.ts";
```

Variants override bases, compounds override variants, and ordinary utilities override all Varia styles. Explicit important declarations reverse CSS layer precedence.

## Unused atomic CSS

Exclude definition files from Tailwind's source scan. Otherwise their literal utility strings generate atomic classes independently of the Varia classes used by your templates:

```css
@source not "./**/*.config.ts";
```

The path is relative to the stylesheet. Add exclusions for definitions stored elsewhere, or use `source(none)` and explicit template sources.

## Identifier conflicts {#identifier-conflicts}

`tailwindVaria` throws if definitions produce duplicate component or class names. A generated variant can collide with another component's name:

```ts
const button = defineComponent('btn', {
  variants: { c: { primary: 'bg-blue-600' } },
})
const other = defineComponent('btn-c-primary', { base: 'rounded-md' })

tailwindVaria({ components: [button, other] }) // duplicate btn-c-primary
```

Rename the conflicting definition. Avoid names such as `flex`, `grid`, and `hidden`, which overlap Tailwind's built-in utilities and can produce both sets of declarations.

## Prefix mismatch

If your Tailwind import uses `prefix(tw)`, also pass `prefix: 'tw'` to `tailwindVaria`. The plugin interface cannot read prefixes declared in CSS. See [options](/tailwind#options).

## pnpm: `varia/types` subpath {#pnpm-types-subpath}

The type stub resolves a relative path to `node_modules/.varia/manifest.d.ts`. Under pnpm's symlinked package layout, importing `VariaClasses` may need one of these settings:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "preserveSymlinks": true
  }
}
```

```ini
# .npmrc
node-linker=hoisted
```

These settings apply to generated type imports. See the [Type safety recipe](/recipes/type-safety).
