import { styleAfterFieldChanges } from './css-model/sync'
import { textCacheInvalidationChanges } from './text-picture'
import type { SceneNode } from './types'
import { normalizeVectorNetwork } from './vector-network'

export type NodePreviewObserver = (node: SceneNode, changes: Partial<SceneNode>) => void

type PreviewGraph = {
  nodes: Map<string, SceneNode>
  positionPreviewVersion: number
  clearAbsPosCache: () => void
  readonly isApplyingLayout: boolean
  readonly isApplyingDerivedLayout: boolean
}

const LAYOUT_AFFECTING_KEYS = new Set<string>([
  'x',
  'y',
  'width',
  'height',
  'rotation',
  'flipX',
  'flipY',
  'parentId',
  'childIds',
  'layoutMode',
  'layoutDirection',
  'layoutWrap',
  'primaryAxisSizing',
  'counterAxisSizing',
  'itemSpacing',
  'counterAxisSpacing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'layoutGrow',
  'layoutAlignSelf',
  'layoutPositioning',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'visible',
  'text',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'styleRuns',
  'textAutoResize'
])

export function updateNodePreview(
  graph: PreviewGraph,
  id: string,
  changes: Partial<SceneNode>,
  beforeUpdate?: NodePreviewObserver
): Partial<SceneNode> | null {
  const node = graph.nodes.get(id)
  if (!node) return null
  changes = Object.fromEntries(
    (Object.entries(changes) as Array<[string, unknown]>).filter(([, value]) => value !== undefined)
  ) as Partial<SceneNode>
  if ((Object.keys(changes) as (keyof SceneNode)[]).every((key) => node[key] === changes[key])) {
    return null
  }
  const affectsLayout = Object.keys(changes).some((key) => LAYOUT_AFFECTING_KEYS.has(key))
  if (affectsLayout) graph.clearAbsPosCache()
  let normalizedChanges = changes
  // CSS written as is for the families a gesture moves gives way, so the canvas follows it.
  const writes = !graph.isApplyingLayout && !graph.isApplyingDerivedLayout && !('style' in changes)
  const style = writes ? styleAfterFieldChanges(node, Object.keys(changes)) : null
  if (style) normalizedChanges = { ...normalizedChanges, style }
  if (node.type === 'TEXT') {
    normalizedChanges = { ...textCacheInvalidationChanges(node, changes), ...changes }
  }
  if (changes.vectorNetwork) {
    normalizedChanges = {
      ...normalizedChanges,
      vectorNetwork: normalizeVectorNetwork(changes.vectorNetwork)
    }
  }
  beforeUpdate?.(node, normalizedChanges)
  graph.positionPreviewVersion++
  Object.assign(node, normalizedChanges)
  return normalizedChanges
}
