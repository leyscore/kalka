import * as v from 'valibot'

import {
  CSS_CLASS_KINDS,
  createDefaultNode,
  cssClassKind,
  deleteCSSClass,
  documentCSSClasses,
  findCSSClass,
  HTML_CLASS_NAME_PATTERN,
  MAX_HTML_CLASS_LENGTH,
  renameCSSClass,
  resetClassOverrides,
  setCSSClass,
  updateClassFromNode
} from '@open-pencil/scene-graph'

import { assertNodeEditable } from '#core/editor/capabilities'
import { computeAllLayouts } from '#core/layout'
import { nodeIdInput } from '#core/tools/input'
import { defineTool, nodeNotFound } from '#core/tools/schema'

const className = v.pipe(
  v.string(),
  v.regex(HTML_CLASS_NAME_PATTERN, 'Not a class name'),
  v.maxLength(MAX_HTML_CLASS_LENGTH),
  v.description('Class name, without the dot')
)

export const getCSSClasses = defineTool({
  name: 'get_css_classes',
  description:
    "List the document's CSS classes in stylesheet order: each one's CSS, whether it styles boxes or text, and how many layers use it. Layers name classes with set_html_element.",
  execution: { kind: 'async', mutation: 'none' },
  input: v.strictObject({}),
  execute: async (figma) => {
    const { cssClassDeclarations } = await import('@open-pencil/dom-css/export')
    const users = new Map<string, number>()
    for (const node of figma.graph.getAllNodes())
      for (const name of node.htmlClasses) users.set(name, (users.get(name) ?? 0) + 1)
    return {
      classes: documentCSSClasses(figma.graph).map((cssClass) => ({
        name: cssClass.name,
        kind: cssClass.kind,
        css: cssClassDeclarations(cssClass),
        layers: users.get(cssClass.name) ?? 0
      }))
    }
  }
})

export const updateCSSClass = defineTool({
  name: 'update_css_class',
  description:
    'Create a CSS class or change its CSS, such as { "background-color": "#2F5BEA", "border-radius": "999px", "padding": "14px 26px" }, or on a text class { "font-size": "18px", "color": "#121214" }. Only the given properties change, and every layer with the class follows unless it set that value itself. kind says whether a new class styles boxes or text.',
  execution: { kind: 'async', mutation: 'document' },
  input: v.strictObject({
    name: className,
    styles: v.pipe(
      v.record(v.string(), v.string()),
      v.description('CSS properties in kebab-case and their values')
    ),
    kind: v.optional(v.pipe(v.picklist(CSS_CLASS_KINDS), v.description('For a new class')), 'box')
  }),
  execute: async (figma, { name, styles, kind }) => {
    const { cssToNodeChanges } = await import('@open-pencil/dom-css')
    const { cssClassDeclarations } = await import('@open-pencil/dom-css/export')
    const graph = figma.graph
    const current = findCSSClass(graph, name) ?? { name, kind, style: {} }
    const template = {
      ...createDefaultNode(() => '', current.kind === 'text' ? 'TEXT' : 'FRAME'),
      ...structuredClone(current.style)
    }
    const changes = cssToNodeChanges(graph, template, styles)
    setCSSClass(graph, { ...current, style: { ...current.style, ...changes } })
    for (const page of graph.getPages()) computeAllLayouts(graph, page.id)
    const updated = findCSSClass(graph, name)
    return updated ? { name, kind: updated.kind, css: cssClassDeclarations(updated) } : { name }
  }
})

export const editCSSClass = defineTool({
  name: 'edit_css_class',
  description:
    "Manage a CSS class: update_from_layer makes the layer's own values (id) part of the class, so all its layers take them; reset_layer drops the layer's own values for its classes'; rename gives the class and its layers new_name; delete removes the class and leaves its layers as they look.",
  execution: { kind: 'sync', mutation: 'properties' },
  input: v.strictObject({
    action: v.picklist(['update_from_layer', 'reset_layer', 'rename', 'delete']),
    name: v.optional(className),
    id: v.optional(nodeIdInput),
    new_name: v.optional(className)
  }),
  execute: (figma, { action, name, id, new_name }) => {
    const graph = figma.graph
    if (action === 'update_from_layer' || action === 'reset_layer') {
      if (!id) return { error: `${action} needs the layer id` }
      const node = graph.getNode(id)
      if (!node) return nodeNotFound(id)
      assertNodeEditable(graph, id)
      if (action === 'reset_layer') resetClassOverrides(graph, id)
      else if (!updateClassFromNode(graph, id, name))
        return { error: `"${node.name}" has no ${cssClassKind(node)} class to update` }
      for (const page of graph.getPages()) computeAllLayouts(graph, page.id)
      return { id, classes: graph.getNode(id)?.htmlClasses ?? [] }
    }
    if (!name || !findCSSClass(graph, name)) return { error: `No class "${name ?? ''}"` }
    if (action === 'delete') {
      deleteCSSClass(graph, name)
      return { deleted: name }
    }
    if (!new_name || !renameCSSClass(graph, name, new_name))
      return { error: `Cannot rename "${name}" to "${new_name ?? ''}"` }
    return { renamed: name, name: new_name }
  }
})
