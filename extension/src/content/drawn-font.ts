// The family a page draws its text with is not always the first its font stack names: the first
// may never have loaded, or may not be on this computer. A layer keeps one family, the first, so
// the copy's stack starts with the one the page drew.

/** Names that stand for a font of the computer rather than naming one. */
const GENERIC = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
  '-apple-system',
  'blinkmacsystemfont'
])

function bare(family: string): string {
  return family.trim().replace(/^["']|["']$/g, '')
}

/**
 * A font stack with the first family the page can draw moved to its start. `loaded` gives the
 * name a web font the page has loaded goes by in its `@font-face` rule, which the stack may
 * spell in another case; `installed` says the computer has a family. A stack whose first family
 * draws under its own spelling, or that reaches a generic name first, is returned as it is.
 */
export function drawnFirst(
  stack: string,
  loaded: (family: string) => string | undefined,
  installed: (family: string) => boolean
): string {
  const families = stack.split(',').map((family) => family.trim())
  for (const [index, family] of families.entries()) {
    const name = bare(family)
    if (GENERIC.has(name.toLowerCase())) return stack
    const face = loaded(name)
    if (face === undefined && !installed(name)) continue
    if (index === 0 && (face === undefined || face === name)) return stack
    const drawn = face === undefined || face === name ? family : `"${face}"`
    return [drawn, ...families.slice(0, index), ...families.slice(index + 1)].join(', ')
  }
  return stack
}

const SAMPLE = 'mmmmmmmmmmlliWQ@#0123'

/** Whether the computer has a family: text set in it measures unlike the fallbacks' own. */
function installedOn(context: CanvasRenderingContext2D, family: string): boolean {
  return ['monospace', 'serif'].some((fallback) => {
    context.font = `72px ${fallback}`
    const plain = context.measureText(SAMPLE).width
    context.font = `72px "${family.replaceAll('"', '')}", ${fallback}`
    return context.measureText(SAMPLE).width !== plain
  })
}

/**
 * What rewrites the `font-family` of an element's declarations for one copy of the page as it
 * is now: the fonts loaded are read once, and each stack is worked out once.
 */
export function fontStackRewriter(): (declared: string) => string {
  const loaded = new Map<string, string>()
  for (const face of document.fonts)
    if (face.status === 'loaded') loaded.set(bare(face.family).toLowerCase(), bare(face.family))
  const context = document.createElement('canvas').getContext('2d')
  const known = new Map<string, boolean>()
  const installed = (family: string) => {
    if (!context || loaded.has(family.toLowerCase())) return false
    const found = known.get(family) ?? installedOn(context, family)
    known.set(family, found)
    return found
  }
  const stacks = new Map<string, string>()
  return (declared) =>
    declared.replace(/(^|; )font-family: ([^;]+)/, (_match, lead: string, stack: string) => {
      const drawn =
        stacks.get(stack) ??
        drawnFirst(stack, (family) => loaded.get(family.toLowerCase()), installed)
      stacks.set(stack, drawn)
      return `${lead}font-family: ${drawn}`
    })
}
