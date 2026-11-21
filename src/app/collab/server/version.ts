import { omit } from 'es-toolkit'

import type { SceneGraph } from '@kalka/scene-graph'

/**
 * Makes `graph` hold what `incoming` holds, as one edit of the live document: every page under
 * the root is replaced by the incoming ones, keeping the layers' IDs, and the images and
 * variables are the incoming ones. The root stays, with its comments and reviews, so the room
 * keeps its document and everyone in it receives the change like any other edit.
 */
export function replaceDocumentContent(graph: SceneGraph, incoming: SceneGraph): void {
  for (const [hash, data] of incoming.images) graph.images.set(hash, data)
  graph.withBufferedEvents(() => {
    for (const child of graph.getChildren(graph.rootId)) graph.deleteNode(child.id)
    const copy = (id: string, parentId: string) => {
      const node = incoming.getNode(id)
      if (!node) return
      const props = omit(structuredClone(node), ['id', 'parentId', 'childIds'])
      graph.createNodeWithId(id, node.type, parentId, { ...props, childIds: [] })
      for (const childId of node.childIds) copy(childId, id)
    }
    for (const child of incoming.getChildren(incoming.rootId)) copy(child.id, graph.rootId)
  })
  graph.variables.clear()
  for (const [id, variable] of incoming.variables)
    graph.variables.set(id, structuredClone(variable))
  graph.variableCollections.clear()
  for (const [id, collection] of incoming.variableCollections) {
    graph.variableCollections.set(id, structuredClone(collection))
  }
}
