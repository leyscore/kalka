import type { SceneGraph } from '../index'
import { randomHex } from '../random'
import { ANNOTATION_COLORS, type AnnotationCategoryDefinition, type AnnotationColor } from './model'

/**
 * The document's own annotation categories, as Figma's Manage categories keeps them next to its
 * presets: added with a label and a colour, renamed, recoloured, or removed, which leaves the
 * annotations in that category uncategorized.
 */

/** The categories the document defines, in the order they were added. */
export function documentAnnotationCategories(graph: SceneGraph): AnnotationCategoryDefinition[] {
  return graph.getNode(graph.rootId)?.annotationCategories ?? []
}

function writeCategories(graph: SceneGraph, categories: AnnotationCategoryDefinition[]): void {
  graph.updateNode(graph.rootId, { annotationCategories: categories })
}

/** Adds a category; the colour defaults to the first one no category has yet. */
export function addAnnotationCategory(
  graph: SceneGraph,
  label: string,
  color?: AnnotationColor
): AnnotationCategoryDefinition {
  const categories = documentAnnotationCategories(graph)
  const used = new Set(categories.map((category) => category.color))
  const category: AnnotationCategoryDefinition = {
    id: `category-${randomHex(8)}`,
    label: label.trim(),
    color: color ?? ANNOTATION_COLORS.find((name) => !used.has(name)) ?? ANNOTATION_COLORS[0]
  }
  writeCategories(graph, [...categories, category])
  return category
}

/** Renames or recolours a category. */
export function updateAnnotationCategory(
  graph: SceneGraph,
  id: string,
  change: { label?: string; color?: AnnotationColor }
): void {
  const categories = documentAnnotationCategories(graph)
  if (!categories.some((category) => category.id === id)) return
  const edit = (category: AnnotationCategoryDefinition): AnnotationCategoryDefinition => ({
    id: category.id,
    label: change.label === undefined ? category.label : change.label.trim(),
    color: change.color ?? category.color
  })
  writeCategories(
    graph,
    categories.map((category) => (category.id === id ? edit(category) : category))
  )
}

/** Removes a category; the annotations in it are left uncategorized. */
export function removeAnnotationCategory(graph: SceneGraph, id: string): void {
  const categories = documentAnnotationCategories(graph)
  if (!categories.some((category) => category.id === id)) return
  writeCategories(
    graph,
    categories.filter((category) => category.id !== id)
  )
  const threads = graph.getNode(graph.rootId)?.comments ?? []
  if (!threads.some((thread) => thread.annotation?.category === id)) return
  graph.updateNode(graph.rootId, {
    comments: threads.map((thread) => {
      if (thread.annotation?.category !== id) return thread
      const { category: _removed, ...annotation } = thread.annotation
      return { ...thread, annotation }
    })
  })
}

/** The document's category an annotation names, or undefined for a preset or none. */
export function customAnnotationCategory(
  graph: SceneGraph,
  category: string | undefined
): AnnotationCategoryDefinition | undefined {
  if (!category) return undefined
  return documentAnnotationCategories(graph).find((definition) => definition.id === category)
}
