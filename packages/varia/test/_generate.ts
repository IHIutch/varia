import type { DefinedComponent } from '../src/index.js'
import { cssRules } from './_css.js'
import { adapter } from './_engine.js'

/** Merge equivalent rule contexts for the legacy recipe assertions. */
export async function generateCSS(components: DefinedComponent[], classes: string): Promise<string> {
  const css = await adapter.generate(components, classes.trim().split(/\s+/))
  const merged = new Map<string, { selector: string, decls: Record<string, string> }>()
  for (const rule of cssRules(css)) {
    const key = JSON.stringify([rule.layer, rule.media, rule.supports, rule.selector])
    const entry = merged.get(key) ?? { selector: rule.selector, decls: {} }
    Object.assign(entry.decls, rule.decls)
    merged.set(key, entry)
  }
  return [...merged.values()].map(({ selector, decls }) => `${selector}{${Object.entries(decls).map(([prop, value]) => `${prop}:${value};`).join('')}}`).join('\n') + (css.match(/@keyframes[\s\S]*/)?.[0] ?? '')
}
