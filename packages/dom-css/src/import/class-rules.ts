import {
  createDefaultNode,
  cssClassStyle,
  SceneGraph,
  type CSSClass,
  type CSSClassKind
} from '@kalka/scene-graph'

import type { DesignStyleDeclaration } from '../types'
import { parseStyleDeclarations } from './declarations'
import { cssToNodeChanges } from './scene-graph'

export interface ClassRule {
  name: string
  declarations: DesignStyleDeclaration
}

/** A selector that names one class and nothing else, such as `.btn` or `.md\:px-4`. */
const CLASS_SELECTOR = /^\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[^\s.#:[\]>+~,{}()\\])+)$/

function unescapeIdentifier(text: string): string {
  return text.replaceAll(
    /\\([0-9a-fA-F]{1,6}) ?|\\(.)/g,
    (_, hex: string | undefined, char: string) =>
      hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : char
  )
}

/** The end of the block opened at `start`, past nested blocks and strings. */
function blockEnd(css: string, start: number): number {
  let depth = 0
  let quote: string | null = null
  for (let index = start; index < css.length; index++) {
    const char = css[index]
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = null
    } else if (char === '"' || char === "'") quote = char
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) return index
  }
  return css.length
}

/**
 * The rules of a stylesheet that style one class, in order: the classes a Kalka folder keeps in
 * its `styles.css`. Other rules, such as the tag reset or `@media` blocks, are skipped.
 */
export function parseClassRules(css: string): ClassRule[] {
  const text = css.replaceAll(/\/\*[\s\S]*?\*\//g, '')
  const rules: ClassRule[] = []
  let cursor = 0
  while (cursor < text.length) {
    const open = text.indexOf('{', cursor)
    if (open === -1) break
    const end = blockEnd(text, open)
    const selector = text.slice(cursor, open).trim()
    const match = CLASS_SELECTOR.exec(selector)
    if (match) {
      rules.push({
        name: unescapeIdentifier(match[1]),
        declarations: parseStyleDeclarations(text.slice(open + 1, end))
      })
    }
    cursor = end + 1
  }
  return rules
}

/** A class rule as a class of `kind`: the layer fields its declarations set. */
export function cssClassFromRule(rule: ClassRule, kind: CSSClassKind): CSSClass {
  const template = createDefaultNode(() => '', kind === 'text' ? 'TEXT' : 'FRAME')
  const changes = cssToNodeChanges(new SceneGraph(), template, rule.declarations)
  return { name: rule.name, kind, style: cssClassStyle(kind, changes) }
}
