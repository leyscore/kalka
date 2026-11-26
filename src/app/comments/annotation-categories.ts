import {
  addAnnotationCategory,
  customAnnotationCategory,
  removeAnnotationCategory,
  updateAnnotationCategory,
  type AnnotationCategoryDefinition,
  type AnnotationColor,
  type SceneGraph
} from '@kalka/scene-graph'

import { editHandoff } from '@/app/comments/handoff-undo'
import type { EditorStore } from '@/app/editor/active-store'

/**
 * The document's own annotation categories from the editor, as Figma's Manage categories edits
 * them: each change is one undoable step, like an annotation's.
 */

/** The colour each category colour is drawn in, close to Figma's. */
export const ANNOTATION_COLOR_CSS: Record<AnnotationColor, string> = {
  yellow: '#E5A800',
  orange: '#F2711C',
  red: '#E5484D',
  pink: '#E93D82',
  violet: '#8E4EC6',
  blue: '#3E63DD',
  teal: '#12A594',
  green: '#30A46C'
}

/** The left border a callout of one of the document's categories is drawn with. */
export function annotationCategoryStyle(
  graph: SceneGraph,
  category: string | undefined
): { borderLeftColor: string } | undefined {
  const custom = customAnnotationCategory(graph, category)
  return custom ? { borderLeftColor: ANNOTATION_COLOR_CSS[custom.color] } : undefined
}

export function createAnnotationCategory(
  store: EditorStore,
  label: string,
  color?: AnnotationColor
): AnnotationCategoryDefinition {
  return editHandoff(store, 'Add annotation category', () =>
    addAnnotationCategory(store.graph, label, color)
  )
}

export function editAnnotationCategory(
  store: EditorStore,
  id: string,
  change: { label?: string; color?: AnnotationColor }
): void {
  editHandoff(store, 'Edit annotation category', () =>
    updateAnnotationCategory(store.graph, id, change)
  )
}

export function deleteAnnotationCategory(store: EditorStore, id: string): void {
  editHandoff(store, 'Delete annotation category', () => removeAnnotationCategory(store.graph, id))
}
