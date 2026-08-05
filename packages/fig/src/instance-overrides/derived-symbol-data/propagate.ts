import type { SceneNode } from '@open-pencil/scene-graph'
import { copyGeometryPaths } from '@open-pencil/scene-graph/copy'

import { buildClonesMap } from '../sync'
import type { OverrideContext } from '../types'
import { overrideCandidates } from '../utils'

function buildSizeOverriddenCloneUpdates(source: SceneNode, clone: SceneNode): Partial<SceneNode> {
  if (clone.type !== 'INSTANCE' || !source.figmaDerivedLayout) return {}
  const sourceLayout = source.figmaDerivedLayout
  return {
    ...(sourceLayout.x === undefined ? {} : { x: sourceLayout.x }),
    ...(sourceLayout.y === undefined ? {} : { y: sourceLayout.y }),
    figmaDerivedLayout: {
      ...sourceLayout,
      ...clone.figmaDerivedLayout,
      x: sourceLayout.x ?? clone.figmaDerivedLayout?.x,
      y: sourceLayout.y ?? clone.figmaDerivedLayout?.y
    }
  }
}

function buildCloneUpdates(
  ctx: OverrideContext,
  source: SceneNode,
  clone: SceneNode,
  cloneId: string,
  sizeSet: Set<string>
): Partial<SceneNode> {
  const updates: Partial<SceneNode> = {}
  if (sizeSet.has(cloneId)) return buildSizeOverriddenCloneUpdates(source, clone)
  if (source.width !== clone.width) updates.width = source.width
  if (source.height !== clone.height) updates.height = source.height
  if (source.x !== clone.x) updates.x = source.x
  if (source.y !== clone.y) updates.y = source.y
  if (!ctx.geometryOverrideNodes.has(cloneId)) {
    if (source.fillGeometry !== clone.fillGeometry)
      updates.fillGeometry = copyGeometryPaths(source.fillGeometry)
    if (source.strokeGeometry !== clone.strokeGeometry)
      updates.strokeGeometry = copyGeometryPaths(source.strokeGeometry)
  }
  if (source.text === clone.text && source.figmaDerivedTextGlyphs) {
    updates.figmaDerivedTextGlyphs = structuredClone(source.figmaDerivedTextGlyphs)
  }
  if (source.text === clone.text && source.figmaDerivedLayout) {
    updates.figmaDerivedLayout = { ...source.figmaDerivedLayout }
  }
  return updates
}

export function applyGeneratedFreeformStretch(ctx: OverrideContext): void {
  for (const node of overrideCandidates(ctx.graph, ctx.activeNodeIds)) {
    if (
      node.source.format === 'fig' ||
      !node.figmaDerivedLayout ||
      !node.parentId ||
      node.layoutPositioning === 'ABSOLUTE'
    ) {
      continue
    }
    const parent = ctx.graph.getNode(node.parentId)
    if (
      !parent ||
      parent.source.format === 'fig' ||
      parent.layoutMode !== 'NONE' ||
      !parent.figmaDerivedLayout
    ) {
      continue
    }
    const updates: Partial<SceneNode> = {}
    if (
      node.horizontalConstraint === 'STRETCH' &&
      node.figmaDerivedLayout.width !== undefined &&
      node.figmaDerivedLayout.width === parent.figmaDerivedLayout.width
    ) {
      updates.width = node.figmaDerivedLayout.width
    }
    if (
      node.verticalConstraint === 'STRETCH' &&
      node.figmaDerivedLayout.height !== undefined &&
      node.figmaDerivedLayout.height === parent.figmaDerivedLayout.height
    ) {
      updates.height = node.figmaDerivedLayout.height
    }
    if (Object.keys(updates).length > 0) ctx.graph.updateNode(node.id, updates)
  }
}

export function propagateDsdChanges(
  ctx: OverrideContext,
  modified: Set<string>,
  sizeSet: Set<string>
): void {
  if (modified.size === 0) return

  const clonesOf = buildClonesMap(ctx.graph, ctx.activeNodeIds)
  const queue = [...modified]
  const visited = new Set<string>()

  let index = 0
  while (index < queue.length) {
    const sourceId = queue[index]
    index++
    const source = ctx.graph.getNode(sourceId)
    if (!source) continue
    const clones = clonesOf.get(sourceId)
    if (!clones) continue
    for (const cloneId of clones) {
      if (visited.has(cloneId)) continue
      visited.add(cloneId)
      const clone = ctx.graph.getNode(cloneId)
      if (!clone) continue
      const updates = buildCloneUpdates(ctx, source, clone, cloneId, sizeSet)
      if (Object.keys(updates).length > 0) {
        ctx.graph.preserveSourceMetadataDuring(() => ctx.graph.updateNode(cloneId, updates))
      }
      queue.push(cloneId)
    }
  }
}
