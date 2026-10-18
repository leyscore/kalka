import type { SceneGraph } from '@kalka/scene-graph'

/**
 * The parents whose layers a mask group around `id` masks, below the page. A group used as a
 * mask masks with its layers, so a change inside it restyles what it masks. `closest` visits
 * each ancestor once, so a parent cycle in bad data ends the walk.
 */
export function maskedParentsAround(
  graph: SceneGraph,
  id: string | null,
  pageId: string
): string[] {
  const parents: string[] = []
  if (!id) return parents
  graph.closest(id, (node) => {
    if (node.id === pageId) return true
    if (node.isMask && node.parentId) parents.push(node.parentId)
    return false
  })
  return parents
}
