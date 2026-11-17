import * as v from 'valibot'

import type { RenderResult } from '@kalka/design-jsx'
import {
  cssClassKind,
  findCSSClass,
  setCSSClass,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import { finishRenderPlacement, resolveRenderPlacement } from '#core/design-jsx/placement'
import {
  cssClassFromDeclarations,
  documentClassSheet,
  inferredClassKind,
  rememberClassCSS
} from '#core/tools/html/class-css'
import { ESCAPED_HTML_NOTE, unescapedHTML } from '#core/tools/html/escaped'
import { toolNumber } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

/** Recreates an imported subtree in the document, under `parentId`. */
function copySubtree(
  from: SceneGraph,
  node: SceneNode,
  to: SceneGraph,
  parentId: string
): SceneNode {
  const { id: _id, childIds, parentId: _parentId, ...props } = node
  const created = to.createNode(node.type, parentId, { ...structuredClone(props), childIds: [] })
  for (const childId of childIds) {
    const child = from.getNode(childId)
    if (child) copySubtree(from, child, to, created.id)
  }
  return created
}

/** The text of the `<style>` elements of written HTML. */
function styleSheets(html: string): string {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n')
}

/**
 * Keeps the class rules of written HTML as document classes, so the layers that name them share
 * one style, also in HTML written later; a class the document already has is left as it is. A
 * class no written layer uses yet takes the kind its declarations style.
 */
async function registerClasses(
  graph: SceneGraph,
  html: string,
  written: readonly SceneNode[]
): Promise<Record<string, Record<string, string>>> {
  const { parseClassRules } = await import('@kalka/dom-css/import')
  const nodes = written.flatMap((root) => [
    root,
    ...graph.flattenTree(root.id).map((entry) => entry.node)
  ])
  const ignored: Record<string, Record<string, string>> = {}
  for (const rule of parseClassRules(styleSheets(html))) {
    rememberClassCSS(graph, rule.name, rule.declarations)
    if (findCSSClass(graph, rule.name)) continue
    const user = nodes.find((node) => node.htmlClasses.includes(rule.name))
    const kind = user ? cssClassKind(user) : inferredClassKind(rule.declarations)
    const made = await cssClassFromDeclarations(rule.name, kind, rule.declarations)
    setCSSClass(graph, made.cssClass)
    // What the browser inherits from the rule, such as a button's font for its label, the
    // layers already have; only a later layer naming the class relies on the class itself.
    if (Object.keys(made.ignored).length > 0) ignored[rule.name] = made.ignored
  }
  return ignored
}

export const writeHTML = defineTool({
  name: 'write_html',
  description:
    'Write HTML and CSS into the design as editable layers: elements become frames and text, flex layouts become auto layout, inline styles and <style> rules are kept, and a rule for one class (.btn { ... }) becomes a document class its layers share. Scripts and event handlers are dropped; a kalka-image:<hash> source from get_html is the document image it names. Use parent_id to write into a frame and replace_id to replace a placeholder. Write one visual group per call, such as one section of a page into its parent, so the user watches the design build.',
  execution: { kind: 'async', mutation: 'document' },
  input: v.strictObject({
    html: v.pipe(
      v.string(),
      v.minLength(1),
      v.description('HTML to write, optionally with <style>')
    ),
    parent_id: v.optional(v.pipe(v.string(), v.description('Frame or page to write into'))),
    replace_id: v.optional(
      v.pipe(v.string(), v.description('Layer to replace; the new layers take its place'))
    ),
    insert_index: v.optional(
      toolNumber(v.pipe(v.number(), v.description('Position among siblings (0 = first)')))
    ),
    x: v.optional(toolNumber(v.pipe(v.number(), v.description('X position of the first layer')))),
    y: v.optional(toolNumber(v.pipe(v.number(), v.description('Y position of the first layer'))))
  }),
  execute: async (figma, args) => {
    const [{ htmlToSceneGraph }, { resolveHTMLImageReferences }] = await Promise.all([
      import('@kalka/dom-css'),
      import('#core/tools/html/images')
    ])
    // Images `get_html` named by reference come back as the document's own.
    const written = unescapedHTML(args.html)
    const html = resolveHTMLImageReferences(figma.graph, written.html)
    // Classes written earlier style this HTML as they will on the canvas; its own rules win.
    const classSheet = await documentClassSheet(figma.graph)
    const imported = await htmlToSceneGraph(
      classSheet ? `<style>${classSheet}</style>${html}` : html,
      { pageName: 'HTML' }
    )
    const roots = imported.getPages().flatMap((page) => imported.getChildren(page.id))
    if (roots.length === 0) return { error: 'The HTML has no visible elements' }
    const graph = figma.graph
    const placement = resolveRenderPlacement(graph, args, figma.currentPageId)
    for (const [hash, bytes] of imported.images) graph.images.set(hash, bytes)
    const results: RenderResult[] = roots.map((root, index) => {
      const created = copySubtree(imported, root, graph, placement.parentId)
      if (index === 0 && (placement.x !== undefined || placement.y !== undefined)) {
        graph.updateNode(created.id, { x: placement.x ?? created.x, y: placement.y ?? created.y })
      }
      return { id: created.id, name: created.name, type: created.type, childIds: created.childIds }
    })
    finishRenderPlacement(graph, results, placement)
    const ignored = await registerClasses(
      graph,
      html,
      results.flatMap((result) => graph.getNode(result.id) ?? [])
    )
    const reply: {
      layers: { id: string; name: string; type: string }[]
      class_css_not_kept?: Record<string, Record<string, string>>
      note?: string
    } = { layers: results.map(({ id, name, type }) => ({ id, name, type })) }
    if (Object.keys(ignored).length > 0) reply.class_css_not_kept = ignored
    if (written.decoded) reply.note = ESCAPED_HTML_NOTE
    return reply
  }
})
