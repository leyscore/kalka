import { computed } from 'vue'
import type { ComputedRef } from 'vue'

import type { Editor } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'

import { MIXED, type MergedNodeSelection } from '#vue/controls/node-props/use'

/** Figma's bounds for a polygon's sides and a star's points. */
export const MIN_POINT_COUNT = 3
export const MAX_POINT_COUNT = 60

/** A star's inner radius as a share of its outer one, which Figma shows as Ratio. */
const MIN_STAR_RATIO = 0.01
const MAX_STAR_RATIO = 1

type PolygonKey = 'pointCount' | 'starInnerRadius'
type PolygonSnapshot = Pick<SceneNode, PolygonKey | 'fillGeometry' | 'strokeGeometry'>

export function clampPointCount(value: number): number {
  return Math.min(MAX_POINT_COUNT, Math.max(MIN_POINT_COUNT, Math.round(value)))
}

export function clampStarRatio(value: number): number {
  return Math.min(MAX_STAR_RATIO, Math.max(MIN_STAR_RATIO, value))
}

/** Whether every selected layer is a polygon or a star, and the Count and Ratio they show. */
export function createPolygonState({ nodes, merged }: MergedNodeSelection) {
  const hasPointCount = computed(
    () =>
      nodes.value.length > 0 &&
      nodes.value.every((node) => node.type === 'POLYGON' || node.type === 'STAR')
  )
  const hasStarRatio = computed(
    () => nodes.value.length > 0 && nodes.value.every((node) => node.type === 'STAR')
  )
  const pointCountValue = computed(() => merged('pointCount'))
  const starRatioPercent = computed(() => {
    const value = merged('starInnerRadius')
    return value === MIXED ? MIXED : Math.round(value * 100)
  })
  return { hasPointCount, hasStarRatio, pointCountValue, starRatioPercent }
}

/**
 * Count and Ratio edits: a scrub previews on the layers and the release records one undo step.
 * The outline is drawn again from the new count, so a shape imported with its saved path drops it.
 */
export function createPolygonActions(editor: Editor, nodes: ComputedRef<SceneNode[]>) {
  const previous = new Map<string, PolygonSnapshot>()

  function update(key: PolygonKey, value: number) {
    const normalized = key === 'pointCount' ? clampPointCount(value) : clampStarRatio(value)
    for (const node of nodes.value) {
      if (key === 'starInnerRadius' && node.type !== 'STAR') continue
      if (!previous.has(node.id)) {
        previous.set(node.id, {
          pointCount: node.pointCount,
          starInnerRadius: node.starInnerRadius,
          fillGeometry: node.fillGeometry,
          strokeGeometry: node.strokeGeometry
        })
      }
      editor.updateNode(node.id, { [key]: normalized, fillGeometry: [], strokeGeometry: [] })
    }
  }

  function commit(key: PolygonKey, value: number) {
    if (previous.size === 0) update(key, value)
    const label = key === 'pointCount' ? 'Change point count' : 'Change star ratio'
    editor.undo.runBatch(label, () => {
      for (const [id, snapshot] of previous) editor.commitNodeUpdate(id, snapshot, label)
    })
    previous.clear()
  }

  return {
    updatePointCount: (value: number) => update('pointCount', value),
    commitPointCount: (value: number) => commit('pointCount', value),
    updateStarRatio: (percent: number) => update('starInnerRadius', percent / 100),
    commitStarRatio: (percent: number) => commit('starInnerRadius', percent / 100)
  }
}
