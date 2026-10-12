const VOID_TAGS = new Set([
  'area',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'wbr'
])
const TOKEN = /(<style[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]+>)/
const INDENT = '  '

function tagName(tag: string): string {
  return /^<\/?([a-zA-Z][\w-]*)/.exec(tag)?.[1]?.toLowerCase() ?? ''
}

/** A `<style>` block with one rule per line, so a reset or a class reads at a glance. */
function formatStyle(block: string, indent: string): string[] {
  const match = /^(<style[^>]*>)([\s\S]*?)(<\/style>)$/.exec(block)
  if (!match) return [indent + block]
  const rules = match[2]
    .split('}')
    .map((rule) => rule.trim())
    .filter((rule) => rule.length > 0)
    .map((rule) => `${indent}${INDENT}${rule}}`)
  return [indent + match[1], ...rules, indent + match[3]]
}

/**
 * Exported HTML laid out for reading: one element per line, indented by depth, with an element
 * that holds only text kept on its line. It changes whitespace between tags only.
 */
export function formatHTML(html: string): string {
  const lines: string[] = []
  let depth = 0
  // Whether the last line opened an element that has held only text so far.
  let openInline = false
  for (const token of html.split(TOKEN)) {
    if (token.length === 0) continue
    const indent = INDENT.repeat(depth)
    if (token.startsWith('<style')) {
      lines.push(...formatStyle(token, indent))
      openInline = false
    } else if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1)
      if (openInline) lines[lines.length - 1] += token
      else lines.push(INDENT.repeat(depth) + token)
      openInline = false
    } else if (token.startsWith('<')) {
      lines.push(indent + token)
      const opens =
        !token.startsWith('<!') && !token.endsWith('/>') && !VOID_TAGS.has(tagName(token))
      if (opens) depth += 1
      openInline = opens
    } else if (token.trim().length > 0) {
      if (openInline) lines[lines.length - 1] += token
      else lines.push(indent + token.trim())
    }
  }
  return lines.join('\n')
}
