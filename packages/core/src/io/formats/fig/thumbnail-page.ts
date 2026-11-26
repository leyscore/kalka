import type { SceneGraph } from '@kalka/scene-graph'

type ThumbnailPage = {
  id: string
  name: string
}

const COVER_PAGE_NAME = 'cover'

/** Resolve the conventional Figma cover page without falling back to unrelated content. */
export function findFigThumbnailPageId(pages: readonly ThumbnailPage[]): string | undefined {
  const normalizedNames = pages.map((page) => ({
    page,
    name: page.name.trim().toLocaleLowerCase()
  }))
  return (
    normalizedNames.find(({ name }) => name === COVER_PAGE_NAME)?.page.id ??
    normalizedNames.find(({ name }) => name.includes(COVER_PAGE_NAME))?.page.id
  )
}

/** The layer set as the file's thumbnail and its page, when it is still in the document. */
export function thumbnailLayer(graph: SceneGraph): { nodeId: string; pageId: string } | null {
  const node = graph.thumbnailNodeId ? graph.getNode(graph.thumbnailNodeId) : undefined
  const page = node?.parentId ? graph.getNode(node.parentId) : undefined
  return node && page?.type === 'CANVAS' ? { nodeId: node.id, pageId: page.id } : null
}
