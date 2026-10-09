/**
 * What an imported page keeps: its structure, styles and media, never anything that runs. The
 * runtimes lay imported HTML out in a live document, where an event handler or a script URL
 * would run with the app's rights, so they drop it while parsing.
 */

/** Elements that draw nothing, or that load or run other documents and code. */
export const UNSAFE_OR_HIDDEN_TAGS: ReadonlySet<string> = new Set([
  'applet',
  'base',
  'embed',
  'frame',
  'frameset',
  'head',
  'iframe',
  'link',
  'meta',
  'noscript',
  'object',
  'script',
  'style',
  'template',
  'title'
])

const URL_ATTRIBUTES = new Set(['action', 'formaction', 'href', 'poster', 'src', 'xlink:href'])
const SCRIPT_URL =
  /^(?:javascript|vbscript):|^data:(?!image\/(?:png|jpe?g|gif|webp|avif|svg\+xml)[;,])/i

/** A URL as browsers read it: control characters and whitespace inside the scheme are ignored. */
function normalizedURL(value: string): string {
  let url = ''
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (code > 0x20 && (code < 0x7f || code > 0x9f)) url += char
  }
  return url
}

/** Whether an attribute is safe to keep on an imported element. */
export function isSafeAttribute(name: string, value: string): boolean {
  const lower = name.toLowerCase()
  if (lower.startsWith('on') || lower === 'srcdoc') return false
  if (URL_ATTRIBUTES.has(lower) && SCRIPT_URL.test(normalizedURL(value))) return false
  return true
}
