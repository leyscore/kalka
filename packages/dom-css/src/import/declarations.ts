import type { DesignStyleDeclaration } from '../types'

/**
 * Splits CSS text at a separator outside quotes, parentheses, and comments, where CSS itself
 * splits it: `;` between declarations, the first `:` of one.
 */
function splitTopLevel(text: string, separator: string, limit = Infinity): string[] {
  const parts: string[] = []
  let depth = 0
  let quote: string | null = null
  let start = 0
  for (let index = 0; index < text.length && parts.length < limit - 1; index++) {
    const char = text[index]
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") quote = char
    else if (char === '(') depth++
    else if (char === ')') depth = Math.max(0, depth - 1)
    else if (char === separator && depth === 0) {
      parts.push(text.slice(start, index))
      start = index + 1
    }
  }
  parts.push(text.slice(start))
  return parts
}

function stripComments(text: string): string {
  return text.replaceAll(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * The declarations of a `style` attribute, as written: property names lowercased, values
 * trimmed, `!important` dropped, and a later declaration of a property replacing an earlier one.
 * Needs no CSS object model, so browsers can bundle it.
 */
export function parseStyleDeclarations(text: string | undefined): DesignStyleDeclaration {
  const style: DesignStyleDeclaration = {}
  if (!text) return style
  for (const declaration of splitTopLevel(stripComments(text), ';')) {
    const parts = splitTopLevel(declaration, ':', 2)
    if (parts.length < 2) continue
    const [rawProperty, rawValue] = parts
    const property = rawProperty.trim()
    const value = rawValue.replace(/!\s*important\s*$/i, '').trim()
    if (!property || !value) continue
    // Custom properties keep their case, as CSS compares them case-sensitively.
    style[property.startsWith('--') ? property : property.toLowerCase()] = value
  }
  return style
}
