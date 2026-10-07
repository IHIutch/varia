# Troubleshooting

## Unexpected variant precedence

Import `variacss/tailwind.css` before Tailwind. Layer order must exist before any generated component rule:

```css
@import "variacss/tailwind.css";
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

## Editor suggestions

Use native Tailwind CSS IntelliSense. Check its output panel and stylesheet-to-app mapping when suggestions are missing. See [editor support](/recipes/type-safety) for imported-recipe refresh and the extension's linting boundary.

## Invalid utility syntax

Tailwind validates utilities when compiling active expansions. Unsupported variant groups such as `hover:(bg-blue-600 text-white)` must be written as `hover:bg-blue-600 hover:text-white`. Unused expansions are not resolved.

## Configuration errors

| Failure | Cause and correction |
| --- | --- |
| Invalid component or class identifier | Use lowercase names starting with a letter, with digits/hyphens afterward. `defineComponent('Card', ...)` must become `defineComponent('card', ...)`. Generated variant identifiers follow the same rule. |
| Duplicate component/shortcut/class | Rename the conflicting definition or register it once. The error identifies the conflicting names/owners, including across plugin registrations. |
| Empty expansion, ambiguous variant map, or unknown slot/compound condition | Supply a nonempty utility string; separate declared slot keys from value keys; reference existing slots and variant values. The authoring error identifies the component/variant or condition. See the definition shapes above. |
| Tailwind rejects a variant group in an active expansion | Replace `hover:(bg-blue-600 text-white)` with `hover:bg-blue-600 hover:text-white`. |
| Required layer stylesheet missing | Import `variacss/tailwind.css` before `tailwindcss` in the CSS entry. The plugin's check detects a missing marker; it cannot reliably detect reversed imports. Keep the documented order. |
| Invalid prefix or missing prefixed CSS | `prefix` must contain lowercase ASCII letters only. Match CSS `prefix(tw)` with `tailwindVaria({ prefix: 'tw', ... })` and use `tw:card` / `tw:md:card-size-lg` in markup. |
| Tailwind cannot apply an unknown utility | Fix the spelling, define it with native `@utility`, or restore the required theme token. Only active expansions are resolved; unused invalid utilities may remain undetected. Tailwind reports utility-resolution errors directly. |
| CSS/class missing with no build error | Register the definition, include literal class names in scanned sources, and check `@source` paths. Dynamic concatenation is not scanned. Registration alone does not emit CSS. |
| Invalid recipe during development | Fix the error in Vite's terminal. An existing running session recovers through config restart; initial startup errors require starting Vite after the fix. |

These checks reuse the authoring validators and Tailwind utility resolution. Error wording and generated formatting are not compatibility promises. Interaction and accessibility behavior remain the application's responsibility.
