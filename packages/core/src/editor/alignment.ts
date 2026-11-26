import type { SceneNode } from '@kalka/scene-graph'
import { getAbsolutePositionFull, getWorldMatrix } from '@kalka/scene-graph/coordinate'
import { computeAbsoluteBounds } from '@kalka/scene-graph/geometry'
import Matrix from '@kalka/scene-graph/matrix'
import type { Vector } from '@kalka/scene-graph/primitives'

import { createFlipRotateActions } from '#core/editor/alignment/flip-rotate'
import {
  canPositionNode as canPlaceNode,
  canTidyUp,
  smartSelectionOf,
  type SmartGrid
} from '#core/editor/alignment/smart-selection'
import { tidyPositions, type TidyItem } from '#core/editor/alignment/tidy'

import { collectNodePositions, pushPositionUndo } from './history/position'
import type { EditorContext } from './types'

function computeAlignTarget(
  min: number,
  max: number,
  size: number,
  align: 'min' | 'center' | 'max'
): number {
  if (align === 'min') return min
  if (align === 'center') return (min + max) / 2 - size / 2
  return max - size
}

function alignSingleNode(
  ctx: EditorContext,
  node: SceneNode,
  axis: 'horizontal' | 'vertical',
  align: 'min' | 'center' | 'max'
) {
  const parent = node.parentId ? ctx.graph.getNode(node.parentId) : undefined
  const pw = parent?.width ?? 0
  const ph = parent?.height ?? 0

  if (axis === 'horizontal') {
    ctx.graph.updateNode(node.id, { x: computeAlignTarget(0, pw, node.width, align) })
  } else {
    ctx.graph.updateNode(node.id, { y: computeAlignTarget(0, ph, node.height, align) })
  }
}

function alignMultipleNodes(
  ctx: EditorContext,
  nodes: SceneNode[],
  axis: 'horizontal' | 'vertical',
  align: 'min' | 'center' | 'max'
) {
  const absPositions = new Map<string, Vector>()
  for (const n of nodes) absPositions.set(n.id, ctx.graph.getAbsolutePosition(n.id))

  const getPos = (id: string) => absPositions.get(id) ?? { x: 0, y: 0 }
  const b = computeAbsoluteBounds(nodes, getPos)
  const minX = b.x
  const minY = b.y
  const maxX = b.x + b.width
  const maxY = b.y + b.height

  for (const n of nodes) {
    const abs = absPositions.get(n.id)
    if (!abs) continue
    const parentAbs = n.parentId ? ctx.graph.getAbsolutePosition(n.parentId) : { x: 0, y: 0 }

    if (axis === 'horizontal') {
      const target = computeAlignTarget(minX, maxX, n.width, align)
      ctx.graph.updateNode(n.id, { x: target - parentAbs.x })
    } else {
      const target = computeAlignTarget(minY, maxY, n.height, align)
      ctx.graph.updateNode(n.id, { y: target - parentAbs.y })
    }
  }
}

function canPositionNode(ctx: EditorContext, node: SceneNode): boolean {
  return canPlaceNode(ctx.graph, node)
}

function parentLocalDelta(ctx: EditorContext, node: SceneNode, worldDelta: Vector): Vector | null {
  const parent = node.parentId ? ctx.graph.getNode(node.parentId) : undefined
  if (!parent) return worldDelta
  const inverse = Matrix.invert(getWorldMatrix(parent, ctx.graph))
  if (!inverse) return null
  const origin = Matrix.mapPoint(inverse, { x: 0, y: 0 })
  const target = Matrix.mapPoint(inverse, worldDelta)
  return { x: target.x - origin.x, y: target.y - origin.y }
}

function distributeMultipleNodes(
  ctx: EditorContext,
  nodes: SceneNode[],
  axis: 'horizontal' | 'vertical'
) {
  const bounds = new Map(nodes.map((node) => [node.id, getAbsolutePositionFull(node, ctx.graph)]))
  const coordinate = axis === 'horizontal' ? 'boundX' : 'boundY'
  const size = axis === 'horizontal' ? 'width' : 'height'
  const sorted = [...nodes].sort((a, b) => {
    const delta = (bounds.get(a.id)?.[coordinate] ?? 0) - (bounds.get(b.id)?.[coordinate] ?? 0)
    return delta || a.id.localeCompare(b.id)
  })
  const first = sorted[0]
  const last = sorted.at(-1)
  if (!last) return

  const start = bounds.get(first.id)?.[coordinate] ?? 0
  const end = (bounds.get(last.id)?.[coordinate] ?? 0) + (bounds.get(last.id)?.[size] ?? 0)
  const totalSize = sorted.reduce((sum, node) => sum + (bounds.get(node.id)?.[size] ?? 0), 0)
  const gap = (end - start - totalSize) / (sorted.length - 1)
  let cursor = start

  for (const node of sorted) {
    const nodeBounds = bounds.get(node.id)
    if (!nodeBounds) continue
    const distance = cursor - nodeBounds[coordinate]
    const localDelta = parentLocalDelta(
      ctx,
      node,
      axis === 'horizontal' ? { x: distance, y: 0 } : { x: 0, y: distance }
    )
    if (!localDelta) continue
    ctx.graph.updateNode(node.id, { x: node.x + localDelta.x, y: node.y + localDelta.y })
    cursor += nodeBounds[size] + gap
  }
}

export function createAlignmentActions(ctx: EditorContext) {
  function canDistributeNodes(nodeIds: string[]): boolean {
    const nodes = nodeIds
      .map((id) => ctx.graph.getNode(id))
      .filter((node): node is SceneNode => node != null)
    return nodes.length >= 3 && nodes.every((node) => canPositionNode(ctx, node))
  }

  function alignNodes(
    nodeIds: string[],
    axis: 'horizontal' | 'vertical',
    align: 'min' | 'center' | 'max'
  ) {
    if (nodeIds.length === 0) return

    const nodes = nodeIds
      .map((id) => ctx.graph.getNode(id))
      .filter((n): n is SceneNode => n != null)
    if (nodes.length === 0) return

    const originals = collectNodePositions(
      ctx,
      nodes.map((node) => node.id)
    )

    if (nodes.length === 1) {
      alignSingleNode(ctx, nodes[0], axis, align)
    } else {
      alignMultipleNodes(ctx, nodes, axis, align)
    }

    const finals = collectNodePositions(ctx, originals.keys())
    pushPositionUndo(ctx, 'Align', originals, finals)

    for (const id of nodeIds) ctx.runLayoutForNode(id)
    ctx.requestRender()
  }

  function distributeNodes(nodeIds: string[], axis: 'horizontal' | 'vertical') {
    const nodes = nodeIds
      .map((id) => ctx.graph.getNode(id))
      .filter((node): node is SceneNode => node != null)
    if (!canDistributeNodes(nodeIds)) return

    const originals = collectNodePositions(
      ctx,
      nodes.map((node) => node.id)
    )
    distributeMultipleNodes(ctx, nodes, axis)
    const finals = collectNodePositions(ctx, originals.keys())
    pushPositionUndo(ctx, 'Distribute', originals, finals)

    for (const id of nodeIds) ctx.runLayoutForNode(id)
    ctx.requestRender()
  }

  function canTidyNodes(nodeIds: string[]): boolean {
    const nodes = nodeIds
      .map((id) => ctx.graph.getNode(id))
      .filter((node): node is SceneNode => node != null)
    return nodes.length >= 2 && nodes.every((node) => canPositionNode(ctx, node))
  }

  function positionableNodes(nodeIds: Iterable<string>): SceneNode[] | null {
    const nodes = [...nodeIds]
      .map((id) => ctx.graph.getNode(id))
      .filter((node): node is SceneNode => node != null)
    return nodes.length > 0 && nodes.every((node) => canPositionNode(ctx, node)) ? nodes : null
  }

  /** The layers' boxes on the page, as Tidy up and smart selection see them. */
  function boxesOf(nodes: readonly SceneNode[]): TidyItem[] {
    return nodes.map((node) => {
      const box = getAbsolutePositionFull(node, ctx.graph)
      return { id: node.id, x: box.boundX, y: box.boundY, width: box.width, height: box.height }
    })
  }

  /** Moves each layer so its box's top left corner lands on its target on the page. */
  function moveBoxesTo(targets: ReadonlyMap<string, Vector>) {
    for (const [id, target] of targets) {
      const node = ctx.graph.getNode(id)
      if (!node) continue
      const box = getAbsolutePositionFull(node, ctx.graph)
      const delta = parentLocalDelta(ctx, node, {
        x: target.x - box.boundX,
        y: target.y - box.boundY
      })
      if (delta) ctx.graph.updateNode(node.id, { x: node.x + delta.x, y: node.y + delta.y })
    }
  }

  /** Figma's Tidy up: the layers in an evenly spaced grid of the rows and columns they form. */
  function tidyNodes(nodeIds: string[]) {
    if (!canTidyNodes(nodeIds)) return
    const nodes = positionableNodes(nodeIds)
    if (!nodes) return
    const originals = collectNodePositions(
      ctx,
      nodes.map((node) => node.id)
    )
    moveBoxesTo(tidyPositions(boxesOf(nodes)))
    const finals = collectNodePositions(ctx, originals.keys())
    pushPositionUndo(ctx, 'Tidy up', originals, finals)

    for (const id of nodeIds) ctx.runLayoutForNode(id)
    ctx.requestRender()
  }

  /**
   * The selection as Figma's smart selection, three or more layers evenly spaced in a row, a
   * column or a grid, whose gaps and order the canvas handles change; null otherwise.
   */
  function smartSelection(nodeIds: Iterable<string>): SmartGrid | null {
    return smartSelectionOf(ctx.graph, nodeIds)
  }

  /** Whether Tidy up would rearrange the layers: they can move and are not evenly placed yet. */
  function canTidyUpSelection(nodeIds: Iterable<string>): boolean {
    return canTidyUp(ctx.graph, nodeIds)
  }

  /**
   * Moves layers so their boxes' top left corners land on the given points on the page, as a
   * smart selection handle previews; `commitArrangement` records it.
   */
  function arrangeNodes(targets: ReadonlyMap<string, Vector>) {
    moveBoxesTo(targets)
    for (const id of targets.keys()) ctx.runLayoutForNode(id)
    ctx.requestRender()
  }

  /** Records the layers' moves since `originals`, their positions in their parents, as one step. */
  function commitArrangement(originals: ReadonlyMap<string, Vector>, label: string) {
    const before = new Map(originals)
    const finals = collectNodePositions(ctx, before.keys())
    const moved = [...finals].some(([id, position]) => {
      const original = before.get(id)
      return !original || original.x !== position.x || original.y !== position.y
    })
    if (moved) pushPositionUndo(ctx, label, before, finals)
  }

  const { flipNodes, rotateNodes } = createFlipRotateActions(ctx)

  return {
    alignNodes,
    arrangeNodes,
    canDistributeNodes,
    canTidyNodes,
    canTidyUpSelection,
    commitArrangement,
    distributeNodes,
    flipNodes,
    rotateNodes,
    smartSelection,
    tidyNodes
  }
}
