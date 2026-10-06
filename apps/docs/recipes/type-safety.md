# Type safety

Use `VariaClasses` to reject unknown class names during TypeScript checking.

## Authoring

`presetVaria` writes `node_modules/.varia/manifest.d.ts` with a union of all registered class names:

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

TypeScript reports the unknown class in your editor and during type checking.

## Going further

The union can also type schema outputs or provide valid names for lint tooling.

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

This schema checks only that the value is a string. It does not reject unknown class names at runtime. For runtime validation, generate a list of class names and pass it to `z.enum`. The declaration manifest contains types, not runtime values.

### ESLint rule

A custom ESLint rule can inspect `class="..."` attributes and reject names outside the Varia union or your project's allow-list. Use TypeScript's type information to read the union.

## pnpm caveat

The `varia/types` subpath may need configuration under pnpm. See the [pnpm note in Troubleshooting](/troubleshooting#pnpm-types-subpath).

