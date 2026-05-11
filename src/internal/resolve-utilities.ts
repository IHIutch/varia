import type { UnoGenerator } from '@unocss/core'
import { expandVariantGroup } from '@unocss/core'

/**
 * Resolved CSS for a utility class string, grouped by pseudo-class state.
 *
 * For slot-keyed variants (ADR-0001) and compound variants (ADR-0002) we need
 * to emit CSS like:
 *
 *   .card-accent .card__title { color: blue }
 *   .card-accent .card__title:hover { color: lightblue }
 *
 * The author writes utility class strings (`text-blue-500 hover:text-blue-300`);
 * presetVaria's emission path needs the resolved CSS property declarations so
 * it can wrap them in arbitrary selectors. `parseToken` from @unocss/core
 * provides the underlying resolution; this module groups the output by
 * pseudo-class state and pulls @property declarations out as top-level rules.
 */
export interface ResolvedUtilities {
  /** CSS-property declarations keyed by pseudo-class state. `base` = no pseudo-class. */
  byState: Record<string, string>
  /** Top-level rules (e.g., `@property` declarations) to hoist into the stylesheet. */
  topLevel: string[]
  /**
   * Declarations wrapped in `@supports` (or `@media`) at-rules, keyed first by the
   * at-rule condition, then by pseudo-class state. Optional — many resolutions
   * produce no at-rule-wrapped output.
   */
  atRuleWrapped?: Record<string, Record<string, string>>
}

// Matches a single trailing pseudo-class segment: `:hover`, `:focus-visible`,
// `:disabled`. Chained pseudo-classes (e.g., `:hover:focus`) and pseudo-elements
// (e.g., `::before`) fall through to 'base'; the input comes from UnoCSS's
// generated selectors where this single-trailing-state pattern covers the cases
// we care about. The simple anchor avoids polynomial backtracking warnings.
const STATE_SUFFIX_RE = /:([a-z][\w-]*)$/

/**
 * Resolve a utility class string to grouped CSS using a UnoCSS generator's
 * parseToken. Throws if any class fails to resolve.
 *
 * The generator must be the SAME instance (or share a config with) the one
 * that ultimately emits the consumer's CSS — theme lookups (`theme(colors.X)`)
 * resolve against that generator's theme, so a mismatch produces wrong colors.
 */
export async function resolveUtilities(
  classes: string,
  uno: UnoGenerator,
): Promise<ResolvedUtilities> {
  const trimmed = classes.trim()
  if (trimmed === '') {
    return { byState: {}, topLevel: [] }
  }

  // Expand `hover:(bg-blue-700 text-white)` → `hover:bg-blue-700 hover:text-white`
  const expanded = expandVariantGroup(trimmed).split(/\s+/).filter(Boolean)

  const byState: Record<string, string[]> = {}
  const topLevel: string[] = []
  const atRuleWrapped: Record<string, Record<string, string[]>> = {}

  for (const cls of expanded) {
    const result = await uno.parseToken(cls)
    if (result == null) {
      throw new Error(
        `resolveUtilities: could not resolve utility "${cls}" — UnoCSS did not recognize it. Check spelling or that the relevant preset is installed.`,
      )
    }

    for (const tuple of result) {
      const [, selector, cssBody, atRule] = tuple

      // Defensive — UnoCSS shouldn't emit tuples with missing core fields, but
      // noUncheckedIndexedAccess means the destructured values are typed
      // `T | undefined` and TypeScript wants us to acknowledge that.
      if (selector === undefined || !cssBody || cssBody.trim() === '')
        continue

      // Top-level rules: @property declarations, @keyframes, etc.
      // These don't belong inside an element selector.
      if (selector.startsWith('@')) {
        topLevel.push(`${selector}{${cssBody}}`)
        continue
      }

      // Extract the pseudo-class state from the selector suffix.
      // Examples:
      //   ".bg-blue-600" → 'base'
      //   ".hover\\:bg-blue-700:hover" → 'hover'
      //   ".focus-visible\\:ring-2:focus-visible" → 'focus-visible'
      //   ".group-hover\\:bg-...:is(.group:hover *)" → falls through to 'base' (group/peer not handled)
      const stateMatch = selector.match(STATE_SUFFIX_RE)
      const state = stateMatch ? stateMatch[1]! : 'base'

      if (atRule) {
        atRuleWrapped[atRule] ??= {}
        atRuleWrapped[atRule][state] ??= []
        atRuleWrapped[atRule][state].push(cssBody)
      }
      else {
        byState[state] ??= []
        byState[state].push(cssBody)
      }
    }
  }

  const result: ResolvedUtilities = {
    byState: mapEntries(byState, bodies => bodies.join('')),
    topLevel: dedupe(topLevel),
  }

  const atRuleKeys = Object.keys(atRuleWrapped)
  if (atRuleKeys.length > 0) {
    result.atRuleWrapped = Object.fromEntries(
      atRuleKeys.map(cond => [
        cond,
        mapEntries(atRuleWrapped[cond]!, bodies => bodies.join('')),
      ]),
    )
  }

  return result
}

/**
 * Emit a CSS rule that applies the resolved utilities under a given selector.
 * Adds `:hover`, `:focus-visible`, etc. suffixes for non-base states. Wraps
 * at-rule-bound declarations in their `@supports` / `@media` blocks. Top-level
 * rules (e.g., `@property`) are emitted unwrapped at the start.
 */
export function emitResolvedCSS(selector: string, resolved: ResolvedUtilities): string {
  const out: string[] = []

  // Top-level rules go first so subsequent rules can reference them.
  for (const rule of resolved.topLevel) {
    out.push(rule)
  }

  for (const [state, body] of Object.entries(resolved.byState)) {
    const fullSelector = state === 'base' ? selector : `${selector}:${state}`
    out.push(`${fullSelector}{${body}}`)
  }

  for (const [condition, states] of Object.entries(resolved.atRuleWrapped ?? {})) {
    const inner: string[] = []
    for (const [state, body] of Object.entries(states)) {
      const fullSelector = state === 'base' ? selector : `${selector}:${state}`
      inner.push(`${fullSelector}{${body}}`)
    }
    out.push(`${condition}{${inner.join('')}}`)
  }

  return out.join('\n')
}

// --- helpers ---

function mapEntries<T, U>(
  obj: Record<string, T>,
  fn: (value: T) => U,
): Record<string, U> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]))
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}
