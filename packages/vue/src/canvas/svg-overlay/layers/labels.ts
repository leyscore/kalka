import {
  canvasLabelForeground,
  frameLabelPlacement,
  labelLayout,
  labelScreenMatrix,
  labelTransform,
  labelViewport,
  resolveFillColor,
  type LabelCache,
  type LabelLayout
} from '@open-pencil/core/canvas'
import { COMPONENT_COLOR, SECTION_TITLE_RADIUS, SELECTION_COLOR } from '@open-pencil/core/constants'
import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'
import { WHITE } from '@open-pencil/scene-graph'
import type { Color } from '@open-pencil/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type MeasureText, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** How far a frame's name fades into the canvas while the frame is not selected or hovered. */
const FRAME_TITLE_MUTED_ALPHA = 0.5
const SECTION_FALLBACK: Color = { r: 0.37, g: 0.37, b: 0.37, a: 1 }

export interface LabelContext extends OverlayContext {
  labels: LabelCache
  viewportSize: { width: number; height: number }
}

/** The part of the page in view, in world units, widened by how far labels reach. */
function visibleWorld(context: LabelContext) {
  const { panX, panY, zoom } = context.view
  const viewport = {
    x: -panX / zoom,
    y: -panY / zoom,
    w: context.viewportSize.width / zoom,
    h: context.viewportSize.height / zoom
  }
  return labelViewport(viewport, zoom)
}

/** `text` cut with an ellipsis to fit `maxWidth`, measured as the overlay draws it. */
export function ellipsize(
  measure: MeasureText,
  text: string,
  fontSize: number,
  fontWeight: number,
  maxWidth: number
): string {
  if (maxWidth <= 0) return ''
  if (measure(text, fontSize, fontWeight) <= maxWidth) return text
  const ellipsis = '…'
  // Where not even one character fits before the ellipsis, the label shows nothing, as in Skia.
  let end = text.length
  while (end > 0 && measure(text.slice(0, end) + ellipsis, fontSize, fontWeight) > maxWidth) end--
  return end > 0 ? text.slice(0, end) + ellipsis : ''
}

function labelText(
  context: LabelContext,
  text: string,
  layout: Pick<LabelLayout, 'text' | 'fontSize' | 'fontWeight' | 'maxTextWidth'>,
  color: string
): OverlayShape {
  return {
    type: 'text',
    x: layout.text.x,
    y: layout.text.y,
    baseline: 'top',
    text: ellipsize(
      context.measureText,
      text,
      layout.fontSize,
      layout.fontWeight,
      layout.maxTextWidth
    ),
    fill: color,
    fontSize: layout.fontSize,
    fontWeight: layout.fontWeight
  }
}

/**
 * Names above the frames on the page and in sections, as Figma shows them: faded, or in the
 * selection color while the frame is selected or hovered.
 */
export function frameTitlesLayer(context: LabelContext): OverlayShape[] {
  const { graph, view, overlays, selectedIds } = context
  const muted = css(canvasLabelForeground(context.pageColor ?? WHITE), FRAME_TITLE_MUTED_ALPHA)
  const shapes: OverlayShape[] = []
  for (const { node } of context.labels.getFrames(
    graph,
    visibleWorld(context),
    overlays.rotationPreview
  )) {
    const placement = frameLabelPlacement(node, graph, overlays.rotationPreview)
    const layout = labelLayout('frame', placement.width * view.zoom)
    if (!layout) continue
    const highlighted = selectedIds.has(node.id) || overlays.hoveredNodeId === node.id
    shapes.push({
      type: 'group',
      matrix: labelScreenMatrix(placement, view),
      children: [labelText(context, node.name, layout, highlighted ? css(SELECTION_COLOR) : muted)]
    })
  }
  return shapes
}

function sectionColors(context: LabelContext, graph: SceneGraph, node: SceneNode) {
  const fill = node.fills.at(0)
  const background = fill?.visible
    ? resolveFillColor(fill, 0, node, graph, 'srgb')
    : SECTION_FALLBACK
  const foreground = canvasLabelForeground(background, context.pageColor ?? WHITE)
  return { background, foreground }
}

/** A section's title: a rounded tag above it, or inside its corner when it is nested. */
export function sectionTitlesLayer(context: LabelContext): OverlayShape[] {
  const { graph, view, overlays } = context
  const shapes: OverlayShape[] = []
  for (const { node, nested } of context.labels.getSections(
    graph,
    visibleWorld(context),
    overlays.rotationPreview
  )) {
    const measured = labelLayout('section', node.width * view.zoom, nested)
    if (!measured) continue
    const width = context.measureText(node.name, measured.fontSize, measured.fontWeight)
    const layout = labelLayout('section', node.width * view.zoom, nested, {
      width,
      height: measured.fontSize
    })
    if (!layout) continue
    const { background, foreground } = sectionColors(context, graph, node)
    const { x, y, width: w, height: h } = layout.bounds
    const tag = { type: 'rect', x, y, width: w, height: h, rx: SECTION_TITLE_RADIUS } as const
    shapes.push({
      type: 'group',
      matrix: labelScreenMatrix(labelTransform(node, graph, overlays.rotationPreview), view),
      children: [
        { ...tag, fill: css(background) },
        ...(overlays.hoveredNodeId === node.id ? [{ ...tag, fill: css(foreground, 0.08) }] : []),
        { ...tag, stroke: css(foreground, 0.22), strokeWidth: 1 },
        labelText(context, node.name, layout, css(foreground))
      ]
    })
  }
  return shapes
}

function diamond(cx: number, cy: number, radius: number): number[] {
  return [cx, cy - radius, cx + radius, cy, cx, cy + radius, cx - radius, cy]
}

/** A component's name with its diamond, four small ones for a component set. */
export function componentLabelsLayer(context: LabelContext): OverlayShape[] {
  const { graph, view, overlays } = context
  const color = css(COMPONENT_COLOR)
  const shapes: OverlayShape[] = []
  for (const { node, inside } of context.labels.getComponents(
    graph,
    visibleWorld(context),
    overlays.rotationPreview
  )) {
    const layout = labelLayout('component', node.width * view.zoom, inside)
    if (!layout?.icon) continue
    const size = layout.icon.width
    const cx = layout.icon.x + size / 2
    const cy = layout.icon.y + size / 2
    const radius = size / 2
    const icons: OverlayShape[] =
      node.type === 'COMPONENT_SET'
        ? [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1]
          ].map(([dx, dy]) => {
            const small = radius * 0.45
            const gap = radius * 0.2
            return {
              type: 'polygon',
              points: diamond(cx + dx * (small + gap), cy + dy * (small + gap), small),
              fill: color
            }
          })
        : [{ type: 'polygon', points: diamond(cx, cy, radius), fill: color }]
    shapes.push({
      type: 'group',
      matrix: labelScreenMatrix(labelTransform(node, graph, overlays.rotationPreview), view),
      children: [...icons, labelText(context, node.name, layout, color)]
    })
  }
  return shapes
}
