import { ref } from 'vue'

import {
  addAnnotation,
  addMeasurement,
  type CommentMeasurement,
  type CommentThread,
  type MeasurementSide
} from '@kalka/scene-graph'

import { currentPersonName } from '@/app/comments/service'
import type { EditorStore } from '@/app/editor/active-store'
import { useLeftPanel } from '@/app/shell/left-panel/use'

/**
 * Annotations and measurements from the editor: Shift+T annotates the selected layer and opens
 * its note in the Code tab, where its annotations, measurements, dev status and dev resources
 * are listed. The threads themselves are comments (`@kalka/scene-graph` annotations).
 */

/** The annotation whose note field takes the focus when the Code tab shows it. */
export const focusedAnnotation = ref<string | null>(null)

/** Whether annotations and measurements show on the canvas, as Figma's Show annotations. */
export const annotationsVisible = ref(true)

function author() {
  return { kind: 'person' as const, name: currentPersonName() }
}

/** Shift+T: a new annotation on the first selected layer, its note open in the Code tab. */
export function annotateSelection(store: EditorStore): CommentThread | null {
  const [id] = store.state.selectedIds
  if (!id) return null
  const thread = addAnnotation(store.graph, id, author(), {})
  if (!thread) return null
  annotationsVisible.value = true
  focusedAnnotation.value = thread.id
  store.requestRefresh()
  useLeftPanel().show('code')
  return thread
}

/**
 * The measurement two selected layers make, as Figma measures between them: across the gap
 * between them on the axis they are apart, or between their facing sides when one holds the
 * other. With one layer, its own width.
 */
export function selectionMeasurement(
  store: EditorStore
): { from: string; measurement: CommentMeasurement } | null {
  const [from, to] = store.state.selectedIds
  if (!from) return null
  if (!to) return { from, measurement: { toNodeId: from, side: 'left', toSameSide: false } }
  const a = store.graph.getAbsoluteBounds(from)
  const b = store.graph.getAbsoluteBounds(to)
  const measure = (side: MeasurementSide, toSameSide: boolean) => ({
    from,
    measurement: { toNodeId: to, side, toSameSide }
  })
  // Apart: across the gap, from the side facing the other layer to the other's facing side.
  if (a.x + a.width <= b.x) return measure('right', false)
  if (b.x + b.width <= a.x) return measure('left', false)
  if (a.y + a.height <= b.y) return measure('bottom', false)
  if (b.y + b.height <= a.y) return measure('top', false)
  // One over the other: the inset between their left sides.
  return measure('left', true)
}

/** Keeps the measurement of the selection on the canvas. */
export function measureSelection(store: EditorStore): CommentThread | null {
  const target = selectionMeasurement(store)
  if (!target) return null
  const thread = addMeasurement(store.graph, target.from, author(), target.measurement)
  if (!thread) return null
  annotationsVisible.value = true
  store.requestRefresh()
  return thread
}
