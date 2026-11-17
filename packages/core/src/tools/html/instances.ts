import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

/**
 * Components in written HTML: `<kalka-instance component="Button">` (a component's id or name)
 * stands for an instance of that component, so a section is composed from the design system's
 * parts rather than drawing copies that drift. The tag is written as a placeholder of the
 * component's size, then each placeholder is swapped for a real instance.
 */

const INSTANCE_TAG = /<kalka-instance\b([^>]*?)(?:\/>|>([\s\S]*?)<\/kalka-instance>)/gi
const PLACEHOLDER_PREFIX = 'kalka-instance-'

function attribute(attributes: string, name: string): string | undefined {
  const match = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(attributes)
  return match ? (match[1] ?? match[2]) : undefined
}

function findComponent(graph: SceneGraph, reference: string): SceneNode | undefined {
  const byId = graph.getNode(reference)
  if (byId?.type === 'COMPONENT') return byId
  const wanted = reference.trim().toLowerCase()
  return [...graph.getAllNodes()].find(
    (node) => node.type === 'COMPONENT' && node.name.trim().toLowerCase() === wanted
  )
}

export interface InstancePlaceholders {
  html: string
  /** Placeholder name to the component it stands for. */
  components: Map<string, string>
  /** Components the HTML names that the document does not have. */
  missing: string[]
}

/** The HTML with each component tag as a placeholder of the component's size. */
export function instancePlaceholders(graph: SceneGraph, html: string): InstancePlaceholders {
  const components = new Map<string, string>()
  const missing: string[] = []
  let index = 0
  const replaced = html.replace(INSTANCE_TAG, (_tag, attributes: string) => {
    const reference = attribute(attributes, 'component') ?? ''
    const component = findComponent(graph, reference)
    if (!component) {
      missing.push(reference)
      return ''
    }
    const name = `${PLACEHOLDER_PREFIX}${++index}`
    components.set(name, component.id)
    const style = attribute(attributes, 'style') ?? ''
    return `<div id="${name}" style="width: ${component.width}px; height: ${component.height}px; flex-shrink: 0; ${style}"></div>`
  })
  return { html: replaced, components, missing }
}

/** Swaps the placeholders under `roots` for instances, in their place. Returns the instances. */
export function swapInstancePlaceholders(
  graph: SceneGraph,
  roots: readonly string[],
  components: ReadonlyMap<string, string>
): string[] {
  if (components.size === 0) return []
  const placeholders = roots.flatMap((rootId) => [
    ...(graph.getNode(rootId) ? [graph.getNode(rootId)] : []),
    ...graph.flattenTree(rootId).map((entry) => entry.node)
  ])
  const instances: string[] = []
  for (const node of placeholders) {
    const componentId = node && components.get(node.name)
    if (!node || !componentId || !node.parentId) continue
    const parent = graph.getNode(node.parentId)
    const index = parent?.childIds.indexOf(node.id) ?? -1
    const instance = graph.createInstance(componentId, node.parentId, {
      x: node.x,
      y: node.y,
      layoutPositioning: node.layoutPositioning
    })
    if (!instance) continue
    if (index >= 0) graph.insertChildAt(instance.id, node.parentId, index)
    graph.deleteNode(node.id)
    instances.push(instance.id)
  }
  return instances
}
