import { computed, ref } from 'vue'

import type { ScaleSession } from '@kalka/core/editor'
import { getAxisAlignedWorldBounds } from '@kalka/scene-graph/coordinate'
import { computeBounds } from '@kalka/scene-graph/geometry'
import type { Vector } from '@kalka/scene-graph/primitives'

import { useEditor } from '#vue/editor/context'

/** Where the selection stays put while it scales: a corner, an edge's middle or the centre. */
export type ScaleAnchor = `${'top' | 'middle' | 'bottom'}-${'left' | 'center' | 'right'}`

export const SCALE_ANCHORS: readonly ScaleAnchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
]

const ROW = { top: 0, middle: 0.5, bottom: 1 } as const
const COLUMN = { left: 0, center: 0.5, right: 1 } as const

function anchorFraction(anchor: ScaleAnchor): Vector {
  const [row, column] = anchor.split('-') as [keyof typeof ROW, keyof typeof COLUMN]
  return { x: COLUMN[column], y: ROW[row] }
}

/**
 * The Scale tool's numbers, as Figma shows them in the Design panel while K is on: a factor in
 * percent and the anchor the selection scales about. A value scrubbed previews the scale and a
 * committed one keeps it as one undo step, after which the factor reads 100% again.
 */
export function useScaleToolControls() {
  const editor = useEditor()
  const anchor = ref<ScaleAnchor>('top-left')
  const percent = ref(100)
  let session: ScaleSession | null = null

  const active = computed(
    () => editor.state.activeTool === 'SCALE' && editor.state.selectedIds.size > 0
  )

  /** The anchor on the page, from the selection's bounds. */
  function anchorPoint(): Vector | null {
    const rects = [...editor.state.selectedIds].flatMap((id) => {
      const node = editor.graph.getNode(id)
      return node ? [getAxisAlignedWorldBounds(node, editor.graph)] : []
    })
    if (rects.length === 0) return null
    const bounds = computeBounds(rects)
    const fraction = anchorFraction(anchor.value)
    return {
      x: bounds.x + bounds.width * fraction.x,
      y: bounds.y + bounds.height * fraction.y
    }
  }

  function preview(value: number) {
    if (!Number.isFinite(value) || value <= 0) return
    if (!session) {
      const point = anchorPoint()
      session = point ? editor.beginScale(editor.state.selectedIds, point) : null
    }
    session?.update(value / 100)
    percent.value = value
  }

  function commit(value: number) {
    preview(value)
    session?.commit()
    session = null
    percent.value = 100
  }

  function cancel() {
    session?.cancel()
    session = null
    percent.value = 100
  }

  return { active, anchor, anchors: SCALE_ANCHORS, percent, preview, commit, cancel }
}
