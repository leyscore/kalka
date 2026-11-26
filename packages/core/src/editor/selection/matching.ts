import { isEqual, pick } from 'es-toolkit'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { CORNER_FIELDS, TEXT_STYLE_FIELDS } from '@kalka/scene-graph'

import type { EditorContext } from '#core/editor/types'

/** What Figma's Edit ▸ Select all with same … compares. */
export type SelectSameKind =
  | 'fill'
  | 'stroke'
  | 'effect'
  | 'text'
  | 'font'
  | 'instance'
  | 'properties'

export const SELECT_SAME_KINDS = [
  'fill',
  'stroke',
  'effect',
  'text',
  'font',
  'instance',
  'properties'
] as const satisfies readonly SelectSameKind[]

const STROKE_LOOK_FIELDS = ['strokes', 'strokeWeight', 'strokeAlign', 'dashPattern'] as const

function sameStyleOr(
  seed: SceneNode,
  node: SceneNode,
  styleField: 'fillStyleId' | 'strokeStyleId' | 'effectStyleId' | 'textStyleId',
  same: () => boolean
): boolean {
  const style = seed[styleField]
  if (style) return node[styleField] === style
  return !node[styleField] && same()
}

const isText = (seed: SceneNode, node: SceneNode) => seed.type === 'TEXT' && node.type === 'TEXT'

const SAME: Record<SelectSameKind, (seed: SceneNode, node: SceneNode) => boolean> = {
  fill: (seed, node) =>
    seed.fills.length > 0 &&
    sameStyleOr(seed, node, 'fillStyleId', () => isEqual(seed.fills, node.fills)),
  stroke: (seed, node) =>
    seed.strokes.length > 0 &&
    sameStyleOr(seed, node, 'strokeStyleId', () =>
      isEqual(pick(seed, STROKE_LOOK_FIELDS), pick(node, STROKE_LOOK_FIELDS))
    ),
  effect: (seed, node) =>
    seed.effects.length > 0 &&
    sameStyleOr(seed, node, 'effectStyleId', () => isEqual(seed.effects, node.effects)),
  text: (seed, node) =>
    isText(seed, node) &&
    sameStyleOr(seed, node, 'textStyleId', () =>
      isEqual(pick(seed, TEXT_STYLE_FIELDS), pick(node, TEXT_STYLE_FIELDS))
    ),
  font: (seed, node) =>
    isText(seed, node) &&
    seed.fontFamily === node.fontFamily &&
    seed.fontWeight === node.fontWeight &&
    seed.italic === node.italic,
  // A main component stands for its instances, as Figma's Select all instances does.
  instance: (seed, node) => {
    if (node.type !== 'INSTANCE' || !node.componentId) return false
    if (seed.type === 'COMPONENT') return node.componentId === seed.id
    return seed.type === 'INSTANCE' && node.componentId === seed.componentId
  },
  properties: (seed, node) =>
    seed.type === node.type &&
    isEqual(seed.fills, node.fills) &&
    isEqual(pick(seed, STROKE_LOOK_FIELDS), pick(node, STROKE_LOOK_FIELDS)) &&
    isEqual(seed.effects, node.effects) &&
    isEqual(pick(seed, CORNER_FIELDS), pick(node, CORNER_FIELDS)) &&
    seed.opacity === node.opacity
}

/** Whether `node` matches `seed` for a Select all with same command. */
export function matchesSame(kind: SelectSameKind, seed: SceneNode, node: SceneNode): boolean {
  return SAME[kind](seed, node)
}

/** Figma's Select matching layers: the layers of the same kind and name as a selected one. */
export function matchesLayer(seed: SceneNode, node: SceneNode): boolean {
  return seed.type === node.type && seed.name === node.name
}

function pageLayers(graph: SceneGraph, pageId: string): SceneNode[] {
  const result: SceneNode[] = []
  const visit = (id: string) => {
    for (const child of graph.getChildren(id)) {
      if (child.internalOnly) continue
      result.push(child)
      visit(child.id)
    }
  }
  visit(pageId)
  return result
}

/**
 * Select all with same … and Select matching layers, on the current page. Each returns whether
 * the selection changed; a selection that matches nothing is kept.
 */
export function createSelectionMatchingActions(
  ctx: EditorContext,
  select: (ids: string[]) => void
) {
  function selectWhere(matches: (seed: SceneNode, node: SceneNode) => boolean): boolean {
    const seeds = [...ctx.state.selectedIds]
      .map((id) => ctx.graph.getNode(id))
      .filter((node): node is SceneNode => node !== undefined)
    if (seeds.length === 0) return false
    const ids = pageLayers(ctx.graph, ctx.state.currentPageId)
      .filter((node) => !node.locked && seeds.some((seed) => matches(seed, node)))
      .map((node) => node.id)
    if (ids.length === 0) return false
    // A selected ancestor and its layer are never selected together: the outer one stays.
    select(ids)
    ctx.requestRender()
    return true
  }

  function selectAllWithSame(kind: SelectSameKind): boolean {
    return selectWhere((seed, node) => matchesSame(kind, seed, node))
  }

  function selectMatchingLayers(): boolean {
    return selectWhere(matchesLayer)
  }

  return { selectAllWithSame, selectMatchingLayers }
}
