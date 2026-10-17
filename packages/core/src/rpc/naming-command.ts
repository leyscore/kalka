import { countBy } from 'es-toolkit/array'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import { isDefaultName } from '#core/lint/utils'

import type { RPCCommand } from './types'

/** Layers one naming request covers at most, so the prompt stays small. */
export const LAYERS_TO_NAME_LIMIT = 40
const TEXT_SNIPPET_LENGTH = 60
const TEXT_SNIPPETS = 3

export interface LayersToNameArgs {
  /** The page or layer whose default-named descendants to list. */
  root_id: string
  limit?: number
}

/** What a model needs to name one layer: its kind, shape, and the words it shows. */
export interface LayerToName {
  id: string
  type: string
  name: string
  width: number
  height: number
  /** The parent's name, unless that is a default name too. */
  parent?: string
  /** Auto layout direction. */
  layout?: 'row' | 'column'
  /** Child layer types and counts, such as `{ TEXT: 2, FRAME: 1 }`. */
  children?: Record<string, number>
  /** The first texts inside the layer, shortened. */
  texts?: string[]
}

export interface LayersToNameResult {
  layers: LayerToName[]
  /** Default-named layers under the root, including those past the limit. */
  total: number
}

function snippet(text: string): string {
  const line = text.replaceAll(/\s+/g, ' ').trim()
  return line.length > TEXT_SNIPPET_LENGTH ? `${line.slice(0, TEXT_SNIPPET_LENGTH - 1)}…` : line
}

function textsInside(graph: SceneGraph, node: SceneNode): string[] {
  const texts: string[] = []
  const visit = (current: SceneNode) => {
    if (texts.length >= TEXT_SNIPPETS) return
    if (current.type === 'TEXT' && current.text.trim()) texts.push(snippet(current.text))
    for (const id of current.childIds) {
      const child = graph.getNode(id)
      if (child) visit(child)
    }
  }
  visit(node)
  return texts
}

function describeLayer(graph: SceneGraph, node: SceneNode): LayerToName {
  const layer: LayerToName = {
    id: node.id,
    type: node.type,
    name: node.name,
    width: Math.round(node.width),
    height: Math.round(node.height)
  }
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  if (parent && parent.type !== 'CANVAS' && !isDefaultName(parent.name)) layer.parent = parent.name
  if (node.layoutMode === 'HORIZONTAL') layer.layout = 'row'
  if (node.layoutMode === 'VERTICAL') layer.layout = 'column'
  const children = node.childIds.flatMap((id) => graph.getNode(id) ?? [])
  if (children.length > 0) layer.children = countBy(children, (child) => child.type)
  const texts = textsInside(graph, node)
  if (texts.length > 0) layer.texts = texts
  return layer
}

/**
 * The layers under a root that still have a default name such as "Frame 12", each with the context
 * a model needs to suggest a name: type, size, layout, child kinds, and the first texts inside.
 * Nothing else about the document leaves the app.
 */
export const layersToNameCommand: RPCCommand<LayersToNameArgs, LayersToNameResult> = {
  name: 'layers_to_name',
  execute: (graph, args) => {
    const root = graph.getNode(args.root_id)
    if (!root) throw new Error(`Layer "${args.root_id}" not found`)
    const limit = Math.max(1, Math.min(args.limit ?? LAYERS_TO_NAME_LIMIT, LAYERS_TO_NAME_LIMIT))
    const layers: LayerToName[] = []
    let total = 0
    const visit = (node: SceneNode) => {
      if (node.type !== 'CANVAS' && node.type !== 'TEXT' && isDefaultName(node.name)) {
        total++
        if (layers.length < limit) layers.push(describeLayer(graph, node))
      }
      for (const id of node.childIds) {
        const child = graph.getNode(id)
        if (child) visit(child)
      }
    }
    visit(root)
    return { layers, total }
  }
}
