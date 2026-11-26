import type { SceneNode } from '@kalka/scene-graph'

import type { EditorContext } from '#core/editor/types'

/** Layers Figma's Set as thumbnail takes: a frame, section or component at the top of a page. */
const THUMBNAIL_TYPES: ReadonlySet<SceneNode['type']> = new Set([
  'FRAME',
  'SECTION',
  'COMPONENT',
  'COMPONENT_SET',
  'INSTANCE'
])

/** Whether a layer can be the file's thumbnail: a top-level frame, section or component. */
export function canBeThumbnail(ctx: Pick<EditorContext, 'graph'>, id: string): boolean {
  const node = ctx.graph.getNode(id)
  const parent = node?.parentId ? ctx.graph.getNode(node.parentId) : undefined
  return node !== undefined && THUMBNAIL_TYPES.has(node.type) && parent?.type === 'CANVAS'
}

/**
 * Figma's Set as thumbnail and Restore default thumbnail: the layer the file's thumbnail shows,
 * instead of its cover page or first page. One undo step each.
 */
export function createThumbnailActions(ctx: EditorContext) {
  function apply(id: string | null) {
    ctx.graph.thumbnailNodeId = id
    ctx.requestRefresh()
  }

  /** Makes `id` the file's thumbnail, or the default again with null; false when nothing changes. */
  function setThumbnailNode(id: string | null): boolean {
    const previous = ctx.graph.thumbnailNodeId
    if (id === previous || (id !== null && !canBeThumbnail(ctx, id))) return false
    apply(id)
    ctx.undo.push({
      label: id ? 'Set as thumbnail' : 'Restore default thumbnail',
      forward: () => apply(id),
      inverse: () => apply(previous)
    })
    return true
  }

  return {
    setThumbnailNode,
    canBeThumbnail: (id: string) => canBeThumbnail(ctx, id)
  }
}
