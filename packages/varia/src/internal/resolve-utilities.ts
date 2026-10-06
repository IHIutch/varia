import type { StringifiedUtil, UnoGenerator } from '@unocss/core'
import { expandVariantGroup, regexScopePlaceholder } from '@unocss/core'

// Parse utilities against a stable alias so their full selectors can be reused
// for component roots, descendants, and compounds without losing variants.
const TARGET_ALIAS = '__varia_target__'
const TARGET_SELECTOR = `.${TARGET_ALIAS}`

export interface ResolvedUtilities {
  rules: { selector: string, body: string, parent?: string }[]
  /** Raw CSS and top-level rules such as @keyframes and @property. */
  topLevel: string[]
}

/** Resolve utilities using the same generator that emits the final stylesheet. */
export async function resolveUtilities(
  classes: string,
  uno: UnoGenerator,
): Promise<ResolvedUtilities> {
  const rules: ResolvedUtilities['rules'] = []
  const topLevel: string[] = []
  const parsed: StringifiedUtil[] = []
  const expanded = expandVariantGroup(classes.trim()).split(/\s+/).filter(Boolean)

  for (const cls of expanded) {
    const result = await uno.parseToken(cls, TARGET_ALIAS)
    if (result == null) {
      throw new Error(
        `resolveUtilities: could not resolve utility "${cls}" — UnoCSS did not recognize it. Check spelling or that the relevant preset is installed.`,
      )
    }

    parsed.push(...result)
  }

  // Match UnoCSS's sheet ordering: parent conditions first, then rule index
  // and sort metadata. Author token order must not change the cascade.
  parsed.sort((a, b) =>
    (uno.parentOrders.get(a[3] ?? '') ?? 0) - (uno.parentOrders.get(b[3] ?? '') ?? 0)
    || (a[3] ?? '').localeCompare(b[3] ?? '')
    || a[0] - b[0]
    || (a[4]?.sort ?? 0) - (b[4]?.sort ?? 0)
    || (a[5]?.currentSelector ?? '').localeCompare(b[5]?.currentSelector ?? '')
    || (a[1] ?? '').localeCompare(b[1] ?? '')
    || a[2].localeCompare(b[2]),
  )

  for (const [, selector, body, parent] of parsed) {
    if (!body || body.trim() === '')
      continue

    // UnoCSS represents raw CSS, including keyframes, without a selector.
    if (selector === undefined || selector.startsWith('@')) {
      const css = selector ? `${selector}{${body}}` : body
      topLevel.push(wrapParents(css, parent))
    }
    else {
      rules.push({ selector, body, parent })
    }
  }

  return { rules, topLevel: [...new Set(topLevel)] }
}

/** Substitute the component selector while preserving states and at-rules. */
export function emitResolvedCSS(selector: string, resolved: ResolvedUtilities): string {
  const out = [...resolved.topLevel]
  for (const rule of resolved.rules) {
    const fullSelector = rule.selector
      .replaceAll(TARGET_SELECTOR, selector)
      .replace(regexScopePlaceholder, ' ')
    out.push(wrapParents(`${fullSelector}{${rule.body}}`, rule.parent))
  }
  return out.join('\n')
}

// UnoCSS separates nested parent conditions with its scope placeholder.
function wrapParents(css: string, parent?: string): string {
  if (!parent)
    return css
  const parents = parent.split(' $$ ')
  return `${parents.join('{')}{${css}${'}'.repeat(parents.length)}`
}
