import * as v from 'valibot'

import type { FigmaAPI } from '#core/figma-api'
import { nodeIdInput } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

const MAX_HTML_LENGTH = 16_000

/**
 * A layer and its children as the HTML agents read and edit: each element marked with its layer
 * id, images named by reference rather than embedded.
 */
export async function layerHTML(figma: FigmaAPI, id: string, style: 'inline' | 'tailwind') {
  const [{ renderNodesToHTML }, { referenceHTMLImages }] = await Promise.all([
    import('#core/io/formats/html'),
    import('#core/tools/html/images')
  ])
  const rendered = await renderNodesToHTML(figma.graph, [id], {
    html: 'fragment',
    style,
    sourceIds: true
  })
  return referenceHTMLImages(figma.graph, rendered.html)
}

export const getHTML = defineTool({
  name: 'get_html',
  description:
    'Get a layer and its children as HTML with CSS, the same code Kalka exports, each element marked with its layer id in data-kalka-node-id. style "inline" puts CSS on each element; "tailwind" uses Tailwind classes. Images are not embedded: each is a kalka-image:<hash> reference, listed in images with its type, pixel size and byte length. write_html accepts these references back as the same images; to see one, call export_image with the id of the element that shows it.',
  execution: { kind: 'async', mutation: 'none' },
  input: v.strictObject({
    id: nodeIdInput,
    style: v.optional(
      v.pipe(v.picklist(['inline', 'tailwind']), v.description('CSS form')),
      'inline'
    )
  }),
  execute: async (figma, { id, style }) => {
    const node = figma.getNodeById(id)
    if (!node) return { error: `Node "${id}" not found` }
    const { html, images } = await layerHTML(figma, id, style)
    const imageList = images.length > 0 ? { images } : {}
    if (html.length > MAX_HTML_LENGTH) {
      return {
        id,
        name: node.name,
        html: html.slice(0, MAX_HTML_LENGTH),
        truncated: true,
        totalLength: html.length,
        ...imageList
      }
    }
    return { id, name: node.name, html, ...imageList }
  }
})
