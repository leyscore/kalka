import {
  INLINE_HTML_TAGS,
  isHTMLTag,
  readIcon,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import type { DesignStyleDeclaration } from '../types'

export const DOM_CSS_PLUGIN_ID = 'open-pencil-dom-css'
export const IMAGE_SOURCE_URL_KEY = 'image-source-url'

/** Layers whose shape only paths describe, which CSS boxes cannot draw. */
export const VECTOR_SHAPES = new Set<SceneNode['type']>([
  'VECTOR',
  'BOOLEAN_OPERATION',
  'STAR',
  'POLYGON'
])

/** The URL an imported image layer was loaded from. */
export function imageSourceURL(node: SceneNode): string | undefined {
  return node.pluginData.find(
    (entry) => entry.pluginId === DOM_CSS_PLUGIN_ID && entry.key === IMAGE_SOURCE_URL_KEY
  )?.value
}

/** The tag a layer's element takes when the layer sets none. */
export function defaultTagForNode(node: SceneNode): string {
  if (node.type === 'TEXT') return 'span'
  if (node.type === 'SECTION') return 'section'
  const fill = node.fills.at(0)
  if ((fill?.type === 'IMAGE' || imageSourceURL(node)) && node.childIds.length === 0) return 'img'
  return 'div'
}

export const INTERACTIVE_TAGS = new Set(['a', 'button'])
/** Tags a parser closes when a block starts inside them, so they may hold text only. */
const TEXT_BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

/**
 * The tag a layer is written with where it sits: one HTML would rewrite on reading (a link in a
 * link, a paragraph around a box) falls back to the tag its type gives, so the page reads back
 * as the layers it was written from.
 */
export function nestedTag(
  graph: SceneGraph,
  node: SceneNode,
  inside: { interactive: boolean }
): string {
  const tag = tagForNode(node)
  if (inside.interactive && INTERACTIVE_TAGS.has(tag)) return defaultTagForNode(node)
  const holdsBlock = node.childIds.some((id) => {
    const child = graph.getNode(id)
    return child !== undefined && child.type !== 'TEXT'
  })
  if (TEXT_BLOCK_TAGS.has(tag) && holdsBlock) return defaultTagForNode(node)
  return tag
}

/**
 * Whether a layer is written as an element whose tag it may choose: a page is `<main>`, and
 * vectors, icons, curved text and images are `<svg>` and `<img>` whatever the layer asks for.
 */
export function canTakeHTMLTag(node: SceneNode): boolean {
  if (node.type === 'CANVAS' || VECTOR_SHAPES.has(node.type) || readIcon(node)) return false
  if (node.type === 'TEXT' && node.textPathData !== null) return false
  return defaultTagForNode(node) !== 'img'
}

/** The tag a layer is written as: its own, unless it draws as an image, which stays an `<img>`. */
export function tagForNode(node: SceneNode): string {
  const fallback = defaultTagForNode(node)
  return node.htmlTag && fallback !== 'img' ? node.htmlTag : fallback
}

/**
 * A frame given an inline tag (`a`, `button`) lays out as the block its `div` was, unless its
 * CSS already sets a display; otherwise the browser would ignore its width and height.
 */
export function withBlockDisplay(
  tag: string,
  style: DesignStyleDeclaration
): DesignStyleDeclaration {
  if (!isHTMLTag(tag) || !INLINE_HTML_TAGS.has(tag) || style.display) return style
  return { ...style, display: 'block' }
}
