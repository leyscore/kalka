import type { SceneGraph } from './index'
import type { SceneNode } from './types'

/**
 * Dev resources: links for developers on a layer (a ticket, the code component, documentation),
 * as Figma's Dev Mode keeps them. A link is never fetched; it opens when someone clicks it.
 */
export interface DevResource {
  name: string
  url: string
}

/** Figma's limit on a link's length. */
export const MAX_DEV_RESOURCE_URL_LENGTH = 2048

/** A web link a developer can open: http or https, a host, no spaces. */
export function isDevResourceURL(url: string): boolean {
  if (url.length > MAX_DEV_RESOURCE_URL_LENGTH || /\s/.test(url)) return false
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname !== ''
}

/** A link added without a name is named after its address, as Figma names it. */
export function devResourceName(resource: DevResource): string {
  return resource.name.trim() || resource.url.replace(/^https?:\/\//, '')
}

/**
 * The links a developer sees on a layer: its own, then, on an instance, its main component's and
 * that component's set's, which only the main component changes.
 */
export function inheritedDevResources(
  graph: SceneGraph,
  node: SceneNode
): { resource: DevResource; from: SceneNode }[] {
  if (node.type !== 'INSTANCE' || !node.componentId) return []
  const main = graph.getNode(node.componentId)
  if (!main) return []
  const set = main.parentId ? graph.getNode(main.parentId) : undefined
  const owners = set?.type === 'COMPONENT_SET' ? [main, set] : [main]
  return owners.flatMap((owner) =>
    owner.devResources.map((resource) => ({ resource, from: owner }))
  )
}
