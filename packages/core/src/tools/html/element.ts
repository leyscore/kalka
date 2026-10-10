import * as v from 'valibot'

import { assignHTMLClasses, HTML_TAGS } from '@open-pencil/scene-graph'

import { assertNodeEditable } from '#core/editor/capabilities'
import { nodeIdInput } from '#core/tools/input'
import { defineTool, nodeNotFound } from '#core/tools/schema'

export const setHTMLElement = defineTool({
  name: 'set_html_element',
  description:
    'Set the HTML tag and class names a layer is exported with, such as tag "h1" for a title, "nav" for a menu, "a" or "button" for an action, and classes "hero card". The tag changes the semantics only: the layer keeps its look. A class the layer did not have brings its CSS; a class the document lacks becomes one with the look the layer has now (see update_css_class). "auto" restores the tag its type gives (a frame is a div, a text a span). Vectors and images keep <svg> and <img>.',
  execution: { kind: 'sync', mutation: 'properties' },
  input: v.strictObject({
    id: nodeIdInput,
    tag: v.optional(
      v.pipe(v.picklist(['auto', ...HTML_TAGS]), v.description('HTML tag, or "auto"'))
    ),
    classes: v.optional(
      v.pipe(
        v.union([v.string(), v.array(v.string())]),
        v.description('Class names, space-separated or as a list; replaces the current ones')
      )
    )
  }),
  execute: (figma, { id, tag, classes }) => {
    const node = figma.graph.getNode(id)
    if (!node) return nodeNotFound(id)
    assertNodeEditable(figma.graph, id)
    if (tag !== undefined) figma.graph.updateNode(id, { htmlTag: tag === 'auto' ? null : tag })
    if (classes !== undefined) assignHTMLClasses(figma.graph, id, classes)
    const updated = figma.graph.getNode(id) ?? node
    return { id, name: updated.name, tag: updated.htmlTag ?? 'auto', classes: updated.htmlClasses }
  }
})
