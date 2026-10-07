import type { AtRule, Container, Document, Root } from 'postcss'
import postcss from 'postcss'

/** One selector of a style rule, with its normalized cascade context. */
export interface CssRule {
  /** Varia layers as `varia.base`; the engine's utility layer as `utilities`. */
  layer: string
  media: string[]
  supports: string[]
  selector: string
  decls: Record<string, string>
}

// Tailwind nests Varia inside `utilities`.
function normalizeLayer(path: string): string {
  return path.replace(/^utilities\.(?=varia)/, '')
}

function ancestors(node: Container | Root | Document | undefined): AtRule[] {
  const out: AtRule[] = []
  for (let parent = node; parent && parent.type !== 'root' && parent.type !== 'document'; parent = parent.parent as Container) {
    if (parent.type === 'atrule')
      out.unshift(parent as AtRule)
  }
  return out
}

function layerPath(atRules: AtRule[]): string[] {
  return atRules.filter(rule => rule.name === 'layer').flatMap(rule => rule.params.split('.'))
}

/** Normalize Tailwind output so tests compare behavior, not formatting. */
export function cssRules(css: string): CssRule[] {
  const out: CssRule[] = []
  postcss.parse(css).walkRules((rule) => {
    const atRules = ancestors(rule.parent as Container)
    if (atRules.some(at => at.name.endsWith('keyframes')))
      return
    const media = [...new Set(atRules.filter(at => at.name === 'media' && at.params !== '(hover: hover)').map(at => at.params))]
    const supports = atRules.filter(at => at.name === 'supports').map(at => at.params)
    const decls: Record<string, string> = {}
    rule.each((node) => {
      if (node.type !== 'decl')
        return
      decls[node.prop] = `${node.value.replace(/^0\./, '.')}${node.important ? ' !important' : ''}`
    })
    for (const selector of rule.selectors)
      out.push({ layer: normalizeLayer(layerPath(atRules).join('.')), media, supports, selector: selector.replace(/\s*([>+~])\s*/g, '$1'), decls })
  })
  return out
}

/** Cascade layers from lowest to highest priority, following CSS ordering rules. */
export function layerOrder(css: string): string[] {
  interface Node { name: string, children: Node[] }
  const root: Node = { name: '', children: [] }
  const declare = (path: string[]): void => {
    let node = root
    for (const name of path) {
      let child = node.children.find(entry => entry.name === name)
      if (!child) {
        child = { name, children: [] }
        node.children.push(child)
      }
      node = child
    }
  }
  postcss.parse(css).walkAtRules('layer', (rule) => {
    const parent = layerPath(ancestors(rule.parent as Container))
    if (rule.nodes) {
      declare([...parent, ...rule.params.split('.')])
    }
    else {
      for (const name of rule.params.split(','))
        declare([...parent, ...name.trim().split('.')])
    }
  })
  // Sublayers come first; a layer's own rules outrank its sublayers.
  const order: string[] = []
  const visit = (node: Node, path: string[]): void => {
    for (const child of node.children)
      visit(child, [...path, child.name])
    if (path.length)
      order.push(normalizeLayer(path.join('.')))
  }
  visit(root, [])
  return order
}
