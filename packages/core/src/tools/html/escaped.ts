/**
 * Agents now and then send HTML with its tags escaped (`&lt;div&gt;` for `<div>`), which would
 * draw the markup as text. Markup with escaped tags and no raw `<` at all can only be that, so it
 * is decoded, and the agent is told; anything with real tags is taken as written, so escaped code
 * shown inside a design stays text.
 */

/** An escaped tag opener: `&lt;` or its numeric forms, then a name, `/` or `!`. */
const ESCAPED_TAG_OPEN = /&(?:lt|#0*60|#x0*3c);[a-z/!]/i

const ENTITIES: [RegExp, string][] = [
  [/&(?:lt|#0*60|#x0*3c);/gi, '<'],
  [/&(?:gt|#0*62|#x0*3e);/gi, '>'],
  [/&(?:quot|#0*34|#x0*22);/gi, '"'],
  [/&(?:apos|#0*39|#x0*27);/gi, "'"],
  // Last, so `&amp;lt;` decodes once, to `&lt;`.
  [/&(?:amp|#0*38|#x0*26);/gi, '&']
]

export const ESCAPED_HTML_NOTE =
  'The HTML arrived escaped (&lt;div&gt; for <div>), which would show its source on the canvas; Kalka decoded it. Send markup as raw HTML from now on.'

/** The HTML to write, decoded when all its tags arrived escaped, and whether it was. */
export function unescapedHTML(html: string): { html: string; decoded: boolean } {
  if (html.includes('<') || !ESCAPED_TAG_OPEN.test(html)) return { html, decoded: false }
  let decoded = html
  for (const [entity, character] of ENTITIES) decoded = decoded.replace(entity, character)
  return { html: decoded, decoded: true }
}
