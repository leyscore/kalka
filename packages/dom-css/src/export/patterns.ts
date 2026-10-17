import { fromUint8Array } from 'js-base64'

import {
  patternSource,
  patternTileCopies,
  patternTileLayout,
  type Fill,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'
import { blendModeToCSS, fillLayerToCSS } from '@kalka/scene-graph/css-model'
import { imageTileSize } from '@kalka/scene-graph/images'

import type { DesignElement, DesignStyleDeclaration } from '../types'
import { serializeNode } from './html'
import type { VectorElementRenderer } from './projection'

const SVG_NS = 'http://www.w3.org/2000/svg'

interface BackgroundLayer {
  image: string
  size: string
  position: string
  blend: string
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/**
 * One pattern fill as a background layer: a tile drawing its source layer, from the SVG export,
 * at each place the tile holds a copy, repeated from the layer's top left corner.
 */
function patternLayer(
  graph: SceneGraph,
  node: SceneNode,
  fill: Fill,
  vectorElement: VectorElementRenderer
): BackgroundLayer | null {
  const source = patternSource(graph, node, fill)
  if (!source) return null
  // The source draws wherever a pattern repeats it, hidden or not, as Figma's sources usually are.
  const drawn = vectorElement(graph, { ...source, visible: true, opacity: 1, rotation: 0 })
  if (drawn?.tagName !== 'svg') return null
  const layout = patternTileLayout(source, fill)
  const width = round(layout.rect.width)
  const height = round(layout.rect.height)
  if (width <= 0 || height <= 0) return null
  const copy: DesignElement = { ...drawn, inlineStyle: undefined }
  const tile: DesignElement = {
    type: 'element',
    tagName: 'svg',
    attrs: {
      xmlns: SVG_NS,
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`
    },
    children: [
      {
        type: 'element',
        tagName: 'g',
        attrs: fill.opacity < 1 ? { opacity: String(round(fill.opacity)) } : {},
        children: patternTileCopies(source, layout).map((position) => ({
          type: 'element',
          tagName: 'g',
          attrs: {
            transform: `translate(${round(position.x)} ${round(position.y)}) scale(${round(layout.scale)})`
          },
          children: [{ ...copy, attrs: { ...copy.attrs, overflow: 'visible' } }]
        }))
      }
    ]
  }
  return {
    image: `url("data:image/svg+xml,${encodeURIComponent(serializeNode(tile))}")`,
    size: `${width}px ${height}px`,
    position: '0 0',
    blend: blendModeToCSS(fill.blendMode) ?? 'normal'
  }
}

/**
 * The background of a layer with a pattern fill, which the CSS table cannot write since the tile
 * draws another layer: every visible fill as a background layer, Figma's bottom-to-top order
 * reversed to CSS's top-to-bottom. Undefined for a layer without a pattern fill it can draw.
 */
export function patternBackground(
  graph: SceneGraph,
  node: SceneNode,
  vectorElement: VectorElementRenderer | undefined
): DesignStyleDeclaration | undefined {
  if (!vectorElement) return undefined
  const fills = node.fills.filter((fill) => fill.visible && fill.type !== 'IMAGE')
  if (!fills.some((fill) => fill.type === 'PATTERN')) return undefined
  const layers: BackgroundLayer[] = []
  let patterned = false
  for (const fill of fills) {
    if (fill.type === 'PATTERN') {
      const layer = patternLayer(graph, node, fill, vectorElement)
      if (layer) layers.push(layer)
      patterned ||= layer !== null
      continue
    }
    const image = fillLayerToCSS(fill, node.width, node.height)
    if (image) {
      const blend = blendModeToCSS(fill.blendMode) ?? 'normal'
      layers.push({ image, size: 'auto', position: '0 0', blend })
    }
  }
  if (!patterned) return undefined
  layers.reverse()
  const style: DesignStyleDeclaration = {
    'background-color': 'transparent',
    'background-image': layers.map((layer) => layer.image).join(', '),
    'background-size': layers.map((layer) => layer.size).join(', '),
    'background-position': layers.map((layer) => layer.position).join(', '),
    'background-repeat': 'repeat',
    // Tiles start at the layer's corner, under a border drawing an inside stroke too.
    'background-origin': 'border-box'
  }
  if (layers.some((layer) => layer.blend !== 'normal')) {
    style['background-blend-mode'] = layers.map((layer) => layer.blend).join(', ')
  }
  return style
}

/**
 * A tiled image fill as the background of its `<img>`: the image repeated at its own size times
 * the paint's scale from the layer's corner. The element's own picture, which CSS cannot repeat,
 * is moved out of its box. Undefined for a layer whose first fill is not a tiled image.
 */
export function tiledImageStyle(
  graph: SceneGraph,
  node: SceneNode
): DesignStyleDeclaration | undefined {
  const fill = node.fills.at(0)
  if (fill?.type !== 'IMAGE' || fill.imageScaleMode !== 'TILE' || !fill.visible) return undefined
  const bytes = fill.imageHash ? graph.images.get(fill.imageHash) : undefined
  const size = bytes && imageTileSize(fill, bytes)
  if (!bytes || !size) return undefined
  return {
    'background-image': `url("data:image/png;base64,${fromUint8Array(bytes)}")`,
    'background-size': `${round(size.width)}px ${round(size.height)}px`,
    'background-repeat': 'repeat',
    'background-origin': 'border-box',
    'object-fit': 'none',
    'object-position': '-100000px 0'
  }
}
