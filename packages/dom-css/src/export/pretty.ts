import type { DesignElement } from '../types'

const INDENT = '  '

/** Elements whose whitespace is content: a breaking space between runs draws as a space. */
const KEEPS_WHITESPACE = new Set(['pre', 'textarea', 'svg'])

/**
 * Whether new lines between an element's children leave its rendering alone. A frame's children
 * are boxes, where whitespace around them draws nothing; text, its runs and SVG stay as written.
 */
export function indentsChildren(node: DesignElement): boolean {
  if (node.sourceSceneNode?.type === 'TEXT') return false
  if (KEEPS_WHITESPACE.has(node.tagName.toLowerCase())) return false
  return node.children.length > 0 && node.children.every((child) => child.type === 'element')
}

/** Where a nested element starts its line, for a serializer that indents by depth. */
export function childIndent(depth: number): string {
  return `\n${INDENT.repeat(depth)}`
}

/**
 * Splits CSS at the braces and semicolons that end its rules and declarations, leaving those in
 * strings and `url(…)` alone, as a data URL carries `;base64,`.
 */
function cssTokens(css: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: string | null = null
  let parens = 0
  for (const character of css) {
    if (quote) {
      current += character
      if (character === quote) quote = null
      continue
    }
    if (character === '"' || character === "'") quote = character
    else if (character === '(') parens++
    else if (character === ')') parens = Math.max(0, parens - 1)
    else if (parens === 0 && (character === '{' || character === '}' || character === ';')) {
      tokens.push(current.trim(), character)
      current = ''
      continue
    }
    current += character
  }
  if (current.trim()) tokens.push(current.trim())
  return tokens.filter((token) => token !== '')
}

/** A declaration as written by hand: `color: red`, a custom property's value untouched. */
function declaration(text: string): string {
  const colon = text.indexOf(':')
  if (colon === -1 || text.startsWith('@')) return text
  return `${text.slice(0, colon).trim()}: ${text.slice(colon + 1).trim()}`
}

/** CSS laid out one declaration per line, rules and `@media` blocks indented by depth. */
export function prettyCSS(css: string): string {
  const lines: string[] = []
  let depth = 0
  let pending = ''
  const pad = () => INDENT.repeat(depth)
  for (const token of cssTokens(css)) {
    if (token === '{') {
      if (depth === 0 && lines.length > 0) lines.push('')
      lines.push(`${pad()}${pending.replace(/\s+/g, ' ')} {`)
      pending = ''
      depth++
    } else if (token === ';') {
      if (pending) lines.push(`${pad()}${declaration(pending)};`)
      pending = ''
    } else if (token === '}') {
      if (pending) lines.push(`${pad()}${declaration(pending)};`)
      pending = ''
      depth = Math.max(0, depth - 1)
      lines.push(`${pad()}}`)
    } else pending = token
  }
  if (pending) lines.push(pending)
  return `${lines.join('\n')}\n`
}
