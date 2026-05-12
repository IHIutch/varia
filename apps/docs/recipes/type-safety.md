# Type safety

Use the `VariaClasses` union to type-check class names at build time. The manifest exists so tooling can refuse unknown strings before they reach the browser.

## Authoring

When `presetVaria` resolves, it writes `node_modules/.varia/manifest.d.ts` containing a union of every valid class across all registered components:

```ts
// node_modules/.varia/manifest.d.ts (generated)
export type VariaClasses
  = | 'btn' | 'btn-c-primary' | 'btn-c-danger' | 'btn-style-solid' | 'btn-style-outline'
    | 'btn-s-sm' | 'btn-s-md' | 'btn-s-lg' | 'btn-outline'
    | 'modal' | 'modal__container' | 'modal__header' | 'modal-size-md'
    /* ... every other valid class ... */
```

The `varia/types` subpath re-exports the union:

```ts
// src/lib/cn.ts
import type { VariaClasses } from 'varia/types'

export function cn(...classes: VariaClasses[]): string {
  return classes.join(' ')
}
```

## Consumption

```ts
import { cn } from './lib/cn'

cn('btn', 'btn-c-primary', 'btn-style-solid', 'btn-s-md')
// returns 'btn btn-c-primary btn-style-solid btn-s-md'

cn('btn', 'btn-c-purple')
// ✗ type error: 'btn-c-purple' is not assignable to type VariaClasses
```

The check is structural. TypeScript catches the typo on save, before any test or build runs.

## Going further

The union is just a string literal type. Anything that consumes string literal types can consume it.

### Zod schema

```ts
import type { VariaClasses } from 'varia/types'
import { z } from 'zod'

const VariaClassSchema = z.custom<VariaClasses>(
  (val): val is VariaClasses => typeof val === 'string',
)
// Type-level check; runtime check needs the manifest at runtime,
// which the union alone doesn't provide.
```

For a true runtime check, generate a Zod enum from the manifest module rather than the type. The manifest file is small and stable enough to commit-snapshot if you want runtime validation.

### ESLint rule

A custom rule that walks `class="..."` attributes and rejects any token not present in `VariaClasses` (or the project's allow-list). The union gives TypeScript the answer; ESLint can read the union via the TypeScript parser plugin.

## pnpm caveat

The `varia/types` subpath may need configuration under pnpm. See the [pnpm note in Troubleshooting](/troubleshooting#pnpm-types-subpath).

