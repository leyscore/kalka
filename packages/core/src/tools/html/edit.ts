import * as v from 'valibot'

import { nodeIdInput } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

import { writeHTML } from './write'

/** How often `find` occurs in `text`, without overlaps. */
function occurrences(text: string, find: string): number {
  return text.split(find).length - 1
}

/**
 * A small change to a layer's HTML without resending all of it: an exact find and replace in the
 * HTML `get_html` gives, written back in the layer's place. A whole rewrite costs the agent the
 * whole markup and risks changing what it did not mean to.
 */
export const editHTML = defineTool({
  name: 'edit_html',
  description:
    'Change part of a layer with an exact find and replace in its HTML, as get_html returns it (inline style): copy, a color, one element, a spacing value. find must occur exactly once: include enough surrounding markup to make it unique. The layer is rewritten in place, so its layers get new ids, listed in layers. Prefer it to resending the whole section with write_html for small changes.',
  execution: { kind: 'async', mutation: 'document' },
  input: v.strictObject({
    id: nodeIdInput,
    find: v.pipe(v.string(), v.minLength(1), v.description('Exact text to find, once')),
    replace: v.pipe(v.string(), v.description('Text to put in its place'))
  }),
  execute: async (figma, { id, find, replace }) => {
    const node = figma.getNodeById(id)
    if (!node) return { error: `Node "${id}" not found` }
    const [{ renderNodesToHTML }, { referenceHTMLImages }] = await Promise.all([
      import('#core/io/formats/html'),
      import('#core/tools/html/images')
    ])
    const rendered = await renderNodesToHTML(figma.graph, [id], {
      html: 'fragment',
      style: 'inline',
      sourceIds: true
    })
    const { html } = referenceHTMLImages(figma.graph, rendered.html)
    const count = occurrences(html, find)
    if (count === 0)
      return { error: 'find does not occur in the layer’s HTML. Call get_html to see it as it is.' }
    if (count > 1)
      return {
        error: `find occurs ${count} times: include more surrounding markup so it occurs once.`
      }
    return writeHTML.execute(figma, { html: html.replace(find, () => replace), replace_id: id })
  }
})
