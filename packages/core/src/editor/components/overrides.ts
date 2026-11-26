import { isEqual } from 'es-toolkit'

import {
  AUTO_LAYOUT_FIELDS,
  CORNER_FIELDS,
  findInstanceAncestor,
  recordInstanceOverride,
  SIZE_CONSTRAINT_FIELDS,
  STROKE_FIELDS,
  TEXT_STYLE_FIELDS,
  type ComponentPropertyReferenceField,
  type InstanceOverrideState,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

/** Fields a component property sets on a layer: they are the property's, not an override. */
const PROPERTY_FIELDS: Record<ComponentPropertyReferenceField, readonly string[]> = {
  TEXT: ['text', 'styleRuns', 'textParagraphs'],
  VISIBLE: ['visible'],
  INSTANCE_SWAP: ['componentId', 'name'],
  SLOT_CONTENT: []
}

export function propertyDrivenFields(node: SceneNode): Set<string> {
  return new Set(node.componentPropertyReferences.flatMap(({ field }) => PROPERTY_FIELDS[field]))
}

/** Records kept beside the overrides to link a swapped nested instance to its layer. */
const BOOKKEEPING_FIELDS = new Set(['sourceComponentId'])

/**
 * The kinds of change an instance can carry, in the order Figma's reset menu lists them. Each
 * resets on its own from the instance's reset menu.
 */
export const INSTANCE_OVERRIDE_GROUPS = [
  'text',
  'textStyle',
  'fill',
  'stroke',
  'effect',
  'appearance',
  'corner',
  'size',
  'layout',
  'visibility',
  'name',
  'swap',
  'variables',
  'other'
] as const

export type InstanceOverrideGroup = (typeof INSTANCE_OVERRIDE_GROUPS)[number]

const GROUP_FIELDS: Record<Exclude<InstanceOverrideGroup, 'other'>, readonly string[]> = {
  text: ['text', 'styleRuns', 'listLines', 'textParagraphs'],
  textStyle: [
    ...TEXT_STYLE_FIELDS,
    'textStyleId',
    'textAutoResize',
    'textTruncation',
    'maxLines',
    'leadingTrim',
    'textDirection'
  ],
  fill: ['fills', 'fillStyleId'],
  stroke: ['strokes', 'strokeStyleId', ...STROKE_FIELDS],
  effect: ['effects', 'effectStyleId'],
  appearance: ['opacity', 'blendMode', 'shader'],
  corner: CORNER_FIELDS,
  size: ['width', 'height', ...SIZE_CONSTRAINT_FIELDS],
  layout: [
    ...AUTO_LAYOUT_FIELDS,
    'layoutGrow',
    'layoutAlignSelf',
    'gridPosition',
    'gridChildHorizontalAlign',
    'clipsContent',
    'itemReverseZIndex',
    'layoutGrids',
    'gridStyleId'
  ],
  visibility: ['visible', 'locked'],
  name: ['name'],
  swap: ['componentId'],
  variables: ['boundVariables', 'variableModes']
}

export function overrideFieldGroup(field: string): InstanceOverrideGroup {
  const base = field.split('/')[0]
  for (const group of INSTANCE_OVERRIDE_GROUPS) {
    if (group !== 'other' && GROUP_FIELDS[group].includes(base)) return group
  }
  return 'other'
}

/**
 * The layer of the component a node copies, which its overrides are measured against. A nested
 * instance links to the component's instance it copies, until a swap points it at a component;
 * the enclosing instance then keeps the layer it copied.
 */
export function componentLayer(
  graph: SceneGraph,
  node: SceneNode,
  owner: SceneNode | undefined
): SceneNode | undefined {
  const linked = node.componentId ? graph.getNode(node.componentId) : undefined
  if (node.type !== 'INSTANCE' || linked?.type === 'INSTANCE') return linked
  const source = owner?.instanceOverrides.descendants.get(node.id)?.get('sourceComponentId')
  return typeof source === 'string' ? graph.getNode(source) : undefined
}

/** The component layer an override of `nodeId` kept on `owner` is measured against. */
function overrideSource(
  graph: SceneGraph,
  owner: SceneNode,
  nodeId: string
): SceneNode | undefined {
  if (nodeId === '' || nodeId === owner.id) {
    const parentOwner = owner.parentId ? findInstanceAncestor(graph, owner.parentId) : undefined
    return parentOwner
      ? componentLayer(graph, owner, parentOwner)
      : graph.getNode(owner.componentId ?? '')
  }
  const node = graph.getNode(nodeId)
  return node ? componentLayer(graph, node, owner) : undefined
}

interface OverrideEntry {
  owner: SceneNode
  /** The layer the field is overridden on: the owner itself or one of its layers. */
  nodeId: string
  field: string
}

function instancesIn(graph: SceneGraph, root: SceneNode): SceneNode[] {
  const result: SceneNode[] = []
  const visit = (node: SceneNode) => {
    if (node.type === 'INSTANCE') result.push(node)
    for (const child of graph.getChildren(node.id)) visit(child)
  }
  visit(root)
  return result
}

/** Every edit the instance and the instances inside it keep, but what component properties set. */
function overrideEntries(graph: SceneGraph, root: SceneNode): OverrideEntry[] {
  const entries: OverrideEntry[] = []
  for (const owner of instancesIn(graph, root)) {
    const add = (nodeId: string, fields: Iterable<string>) => {
      const node = graph.getNode(nodeId)
      if (!node) return
      const driven = propertyDrivenFields(node)
      for (const field of fields) {
        if (BOOKKEEPING_FIELDS.has(field) || driven.has(field)) continue
        entries.push({ owner, nodeId, field })
      }
    }
    add(owner.id, owner.instanceOverrides.self.keys())
    for (const [nodeId, fields] of owner.instanceOverrides.descendants) add(nodeId, fields.keys())
  }
  return entries
}

/** Whether an override still changes its layer: a field set back to the component's is no change. */
function overrideDiffers(graph: SceneGraph, entry: OverrideEntry): boolean {
  if (entry.field === 'componentId') return true
  const node = graph.getNode(entry.nodeId)
  const source = overrideSource(graph, entry.owner, entry.nodeId)
  if (!node || !source) return true
  const field = entry.field.split('/')[0]
  return !isEqual(Reflect.get(node, field), Reflect.get(source, field))
}

/** The kinds of change the instance carries, in reset menu order. */
export function instanceOverrideGroups(
  graph: SceneGraph,
  root: SceneNode
): InstanceOverrideGroup[] {
  const groups = new Set(
    overrideEntries(graph, root)
      .filter((entry) => overrideDiffers(graph, entry))
      .map((entry) => overrideFieldGroup(entry.field))
  )
  return INSTANCE_OVERRIDE_GROUPS.filter((group) => groups.has(group))
}

function withoutFields(
  state: InstanceOverrideState,
  drop: (nodeId: string, field: string) => boolean,
  ownerId: string
): InstanceOverrideState {
  const keep = (nodeId: string, fields: Map<string, unknown>) =>
    new Map([...fields].filter(([field]) => !drop(nodeId, field)))
  const descendants = new Map(
    [...state.descendants]
      .map(([nodeId, fields]) => [nodeId, keep(nodeId, fields)] as const)
      .filter(([, fields]) => fields.size > 0)
  )
  return { self: keep(ownerId, state.self), descendants }
}

function outermostInstance(graph: SceneGraph, root: SceneNode): SceneNode {
  let outermost = root
  for (
    let parent = root.parentId ? findInstanceAncestor(graph, root.parentId) : undefined;
    parent;
    parent = parent.parentId ? findInstanceAncestor(graph, parent.parentId) : undefined
  ) {
    outermost = parent
  }
  return outermost
}

/**
 * Figma's Reset all changes, or the reset of one kind of change: the instance and every instance
 * inside it go back to their components, keeping the values their component properties set.
 */
export function resetInstanceOverrides(
  graph: SceneGraph,
  root: SceneNode,
  group?: InstanceOverrideGroup
): void {
  for (const owner of instancesIn(graph, root)) {
    const drop = (nodeId: string, field: string) => {
      const node = graph.getNode(nodeId)
      if (node && propertyDrivenFields(node).has(field)) return false
      if (!group) return true
      return !BOOKKEEPING_FIELDS.has(field) && overrideFieldGroup(field) === group
    }
    graph.updateNode(owner.id, {
      instanceOverrides: withoutFields(owner.instanceOverrides, drop, owner.id)
    })
  }
  // The outermost instance passes its component's content down to the ones inside it.
  graph.syncInstance(outermostInstance(graph, root).id)
}

/**
 * Figma's Push changes to main component: the instance's edits become its main component's, so
 * every instance of it shows them, and the instance keeps no override of its own. An edit inside
 * a nested instance becomes an override of that instance in the main component. Returns the main
 * component's id, or null when there was nothing to push.
 */
export function pushInstanceOverrides(graph: SceneGraph, root: SceneNode): string | null {
  const main = root.componentId ? graph.getNode(root.componentId) : undefined
  if (main?.type !== 'COMPONENT') return null
  const pushed: OverrideEntry[] = []
  for (const entry of overrideEntries(graph, root)) {
    const node = graph.getNode(entry.nodeId)
    const target =
      entry.nodeId === root.id ? main : overrideSource(graph, entry.owner, entry.nodeId)
    if (!node || !target || !graph.isDescendant(target.id, main.id)) continue
    if (entry.field === 'componentId') {
      if (target.type === 'INSTANCE' && node.componentId)
        graph.swapInstanceComponent(target.id, node.componentId)
    } else {
      const field = entry.field.split('/')[0]
      graph.updateNode(target.id, { [field]: structuredClone(Reflect.get(node, field)) })
      // Inside a nested instance of the main component the value is that instance's override.
      if (target.id !== main.id) recordInstanceOverride(graph, target.id, [field])
    }
    pushed.push(entry)
  }
  if (pushed.length === 0) return null
  for (const owner of new Set(pushed.map((entry) => entry.owner))) {
    const drop = (nodeId: string, field: string) =>
      pushed.some(
        (entry) =>
          entry.owner === owner &&
          entry.field === field &&
          (entry.nodeId === nodeId || (nodeId === owner.id && entry.nodeId === owner.id))
      )
    graph.updateNode(owner.id, {
      instanceOverrides: withoutFields(owner.instanceOverrides, drop, owner.id)
    })
  }
  graph.syncInstancesTogether([main.id])
  return main.id
}
