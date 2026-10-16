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
 * one style; a class the document already has is left as it is.
 */
async function registerClasses(graph: SceneGraph, html: string, written: readonly SceneNode[]) {
  const { cssClassFromRule, parseClassRules } = await import('@kalka/dom-css/import')
  const nodes = written.flatMap((root) => [
    root,
    ...graph.flattenTree(root.id).map((entry) => entry.node)
  ])
  for (const rule of parseClassRules(styleSheets(html))) {
    if (findCSSClass(graph, rule.name)) continue
    const user = nodes.find((node) => node.htmlClasses.includes(rule.name))
    if (user) setCSSClass(graph, cssClassFromRule(rule, cssClassKind(user)))
  }
}

export const writeHTML = defineTool({
  name: 'write_html',
  description:
    'Write HTML and CSS into the design as editable layers: elements become frames and text, flex layouts become auto layout, inline styles and <style> rules are kept, and a rule for one class (.btn { ... }) becomes a document class its layers share. Scripts and event handlers are dropped. Use parent_id to write into a frame and replace_id to replace a placeholder.',
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
    const { htmlToSceneGraph } = await import('@kalka/dom-css')
    const imported = await htmlToSceneGraph(args.html, { pageName: 'HTML' })
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
    await registerClasses(
      graph,
      args.html,
      results.flatMap((result) => graph.getNode(result.id) ?? [])
    )
    return {
      layers: results.map(({ id, name, type }) => ({ id, name, type }))
    }
  }
})
