import { createInstanceOverrideState, type SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { getAxisAlignedWorldBounds } from '@kalka/scene-graph/coordinate'

/** Space Figma leaves between a restored main component and the layers beside it. */
const RESTORED_COMPONENT_GAP = 100

/** Whether an instance's main component is gone from the file, so it can only be restored. */
export function hasMissingMainComponent(graph: SceneGraph, node: SceneNode | undefined): boolean {
  return node?.type === 'INSTANCE' && !!node.componentId && !graph.getNode(node.componentId)
}

/** The component a nested instance shows, following the instances it copies. */
function realMainComponent(graph: SceneGraph, node: SceneNode): SceneNode | undefined {
  let current: SceneNode | undefined = node
  for (let steps = 0; current?.type === 'INSTANCE' && steps < graph.nodes.size; steps++) {
    current = current.componentId ? graph.getNode(current.componentId) : undefined
  }
  return current?.type === 'COMPONENT' ? current : undefined
}

/**
 * Links each layer of the instance to its copy in the restored component, and the copies of
 * nested instances to the components they show. Returns old component layer id → new one.
 */
function relinkLayers(graph: SceneGraph, instance: SceneNode, component: SceneNode) {
  const mapped = new Map<string, string>()
  const visit = (instanceLayer: SceneNode, componentLayer: SceneNode) => {
    instanceLayer.childIds.forEach((childId, index) => {
      const child = graph.getNode(childId)
      const copyId = componentLayer.childIds.at(index)
      const copy = copyId ? graph.getNode(copyId) : undefined
      if (!child || !copy) return
      if (child.componentId) mapped.set(child.componentId, copy.id)
      graph.updateNode(child.id, { componentId: copy.id })
      if (copy.type !== 'INSTANCE') {
        graph.updateNode(copy.id, { componentId: null })
        visit(child, copy)
        return
      }
      const main = realMainComponent(graph, child)
      if (main) graph.swapInstanceComponent(copy.id, main.id, { keepName: true })
      else graph.detachInstance(copy.id)
    })
  }
  visit(instance, component)
  return mapped
}

/**
 * Figma's Restore main component: an instance whose main component was deleted makes it again
 * from what it shows, beside its top-level layer, and it and the other instances of the deleted
 * component become instances of the new one. Returns the new component's id.
 */
export function restoreMainComponent(graph: SceneGraph, instanceId: string): string | null {
  const instance = graph.getNode(instanceId)
  if (!instance || !hasMissingMainComponent(graph, instance) || !instance.componentId) return null
  const deletedId = instance.componentId
  const page = graph.closest(instance.id, (node) => node.type === 'CANVAS')
  if (!page) return null
  const topLevel = graph.closest(instance.id, (node) => node.parentId === page.id) ?? instance
  const beside = getAxisAlignedWorldBounds(topLevel, graph)
  const own = getAxisAlignedWorldBounds(instance, graph)
  const component = graph.cloneTree(instance.id, page.id, {
    type: 'COMPONENT',
    componentId: null,
    instanceOverrides: createInstanceOverrideState(),
    componentPropertyAssignments: {},
    rotation: 0,
    x: beside.x + beside.width + RESTORED_COMPONENT_GAP,
    y: own.y
  })
  if (!component) return null

  const others = graph.getInstances(deletedId).filter((node) => node.id !== instance.id)
  const mapped = relinkLayers(graph, instance, component)
  graph.updateNode(instance.id, {
    componentId: component.id,
    instanceOverrides: createInstanceOverrideState()
  })
  for (const other of others) {
    const visit = (node: SceneNode) => {
      for (const child of graph.getChildren(node.id)) {
        const target = child.componentId ? mapped.get(child.componentId) : undefined
        if (target) graph.updateNode(child.id, { componentId: target })
        if (child.type !== 'INSTANCE') visit(child)
      }
    }
    visit(other)
    graph.updateNode(other.id, { componentId: component.id })
    graph.syncInstance(other.id)
  }
  return component.id
}
