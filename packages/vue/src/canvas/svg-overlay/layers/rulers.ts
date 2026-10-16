import { getGuideScreenSegment, type RulerTheme } from '@kalka/core/canvas'
import {
  MEASUREMENT_COLOR,
  RULER_BADGE_EXCLUSION,
  RULER_BADGE_HEIGHT,
  RULER_BADGE_PADDING,
  RULER_BADGE_RADIUS,
  RULER_BG_COLOR,
  RULER_HIGHLIGHT_ALPHA,
  RULER_MAJOR_TICK,
  RULER_MAJOR_TOLERANCE,
  RULER_MINOR_TICK,
  RULER_SIZE,
  RULER_TARGET_PIXEL_SPACING,
  RULER_TEXT_BASELINE,
  RULER_TEXT_COLOR,
  RULER_TICK_COLOR,
  SELECTION_COLOR,
  SIZE_FONT_SIZE
} from '@kalka/core/constants'
import type { SceneNode } from '@kalka/scene-graph'
import { computeAbsoluteBounds } from '@kalka/scene-graph/geometry'
import Matrix from '@kalka/scene-graph/matrix'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })

export interface RulerContext extends OverlayContext {
  viewportSize: { width: number; height: number }
  theme?: RulerTheme | null
}

/** World units between major ticks: 1, 2 or 5 times a power of ten, about 100px apart. */
export function rulerStep(zoom: number): number {
  const raw = RULER_TARGET_PIXEL_SPACING / zoom
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  if (normalized <= 1) return magnitude
  if (normalized <= 2) return 2 * magnitude
  if (normalized <= 5) return 5 * magnitude
  return 10 * magnitude
}

/** Turned a quarter counterclockwise around a point, for the vertical ruler's text. */
function vertical(x: number, y: number) {
  return Matrix.multiply(Matrix.translated(x, y), Matrix.rotated(-Math.PI / 2))
}

interface Span {
  start: number
  end: number
}

function ticks(
  context: RulerContext,
  axis: 'x' | 'y',
  step: number,
  selection: Span | null,
  colors: { tick: string; text: string }
): OverlayShape[] {
  const R = RULER_SIZE
  const { panX, panY, zoom } = context.view
  const pan = axis === 'x' ? panX : panY
  const length = axis === 'x' ? context.viewportSize.width : context.viewportSize.height
  const minor = step / 5
  const from = Math.floor(-pan / zoom / step) * step
  const to = (length - pan) / zoom
  const shapes: OverlayShape[] = []
  for (let world = from; world <= to; world += minor) {
    const screen = world * zoom + pan
    if (screen < R) continue
    const major = Math.abs(world % step) < RULER_MAJOR_TOLERANCE
    const tick = R * (major ? RULER_MAJOR_TICK : RULER_MINOR_TICK)
    shapes.push(
      axis === 'x'
        ? {
            type: 'line',
            x1: screen,
            y1: R - tick,
            x2: screen,
            y2: R,
            stroke: colors.tick,
            strokeWidth: 1
          }
        : {
            type: 'line',
            x1: R - tick,
            y1: screen,
            x2: R,
            y2: screen,
            stroke: colors.tick,
            strokeWidth: 1
          }
    )
    const nearBadge =
      selection !== null &&
      (Math.abs(screen - selection.start) < RULER_BADGE_EXCLUSION ||
        Math.abs(screen - selection.end) < RULER_BADGE_EXCLUSION)
    if (!major || nearBadge) continue
    const text = {
      type: 'text',
      text: String(Math.round(world)),
      fill: colors.text,
      fontSize: SIZE_FONT_SIZE
    } as const
    shapes.push(
      axis === 'x'
        ? { ...text, x: screen + 2, y: R * RULER_TEXT_BASELINE }
        : {
            type: 'group',
            matrix: vertical(R * RULER_TEXT_BASELINE, screen - 2),
            children: [{ ...text, x: 0, y: 3 }]
          }
    )
  }
  return shapes
}

function badge(context: RulerContext, label: string, at: number, axis: 'x' | 'y'): OverlayShape {
  const R = RULER_SIZE
  const width = context.measureText(label, SIZE_FONT_SIZE) + RULER_BADGE_PADDING * 2
  const h = RULER_BADGE_HEIGHT
  const fill = css(SELECTION_COLOR)
  if (axis === 'x') {
    const x = at - width / 2
    const y = (R - h) / 2
    return {
      type: 'group',
      children: [
        { type: 'rect', x, y, width, height: h, rx: RULER_BADGE_RADIUS, fill },
        {
          type: 'text',
          x: x + RULER_BADGE_PADDING,
          y: R * RULER_TEXT_BASELINE,
          text: label,
          fill: WHITE,
          fontSize: SIZE_FONT_SIZE
        }
      ]
    }
  }
  return {
    type: 'group',
    matrix: vertical(R / 2, at),
    children: [
      { type: 'rect', x: -width / 2, y: -h / 2, width, height: h, rx: RULER_BADGE_RADIUS, fill },
      {
        type: 'text',
        x: -width / 2 + RULER_BADGE_PADDING,
        y: h / 2 - 3,
        text: label,
        fill: WHITE,
        fontSize: SIZE_FONT_SIZE
      }
    ]
  }
}

function guidePositions(context: RulerContext): OverlayShape[] {
  const { graph, overlays, view } = context
  const guides = overlays.guides
  const viewport = { ...view, ...context.viewportSize }
  const fill = css(MEASUREMENT_COLOR, 1)
  const label = (axis: 'x' | 'y', position: number, screen: number): OverlayShape => {
    const text = String(Math.round(position * 100) / 100)
    return axis === 'x'
      ? {
          type: 'text',
          x: screen,
          y: RULER_SIZE * RULER_TEXT_BASELINE,
          text,
          fill,
          fontSize: SIZE_FONT_SIZE,
          anchor: 'middle'
        }
      : {
          type: 'group',
          matrix: vertical(RULER_SIZE * RULER_TEXT_BASELINE, screen),
          children: [{ type: 'text', x: 2, y: 3, text, fill, fontSize: SIZE_FONT_SIZE }]
        }
  }
  if (guides?.preview) {
    const owner = graph.getNode(guides.preview.ownerId)
    if (!owner) return []
    const segment = getGuideScreenSegment(graph, owner, guides.preview, viewport)
    return [
      label(
        guides.preview.axis,
        guides.preview.position,
        guides.preview.axis === 'x' ? segment.x1 : segment.y1
      )
    ]
  }
  const selections = [guides?.selected, guides?.hovered].filter(
    (selection, index, all): selection is NonNullable<typeof selection> =>
      !!selection &&
      (index === 0 || selection.ownerId !== all[0]?.ownerId || selection.guideId !== all[0].guideId)
  )
  return selections.flatMap((selection) => {
    const owner = graph.getNode(selection.ownerId)
    const guide = owner?.guides.find((candidate) => candidate.id === selection.guideId)
    if (!owner || !guide) return []
    const segment = getGuideScreenSegment(graph, owner, guide, viewport)
    return [label(guide.axis, guide.position, guide.axis === 'x' ? segment.x1 : segment.y1)]
  })
}

/** The rulers along the top and left edges, with the selection's extent and guide positions. */
export function rulersLayer(context: RulerContext): OverlayShape[] {
  const { width, height } = context.viewportSize
  if (width === 0 || height === 0) return []
  const R = RULER_SIZE
  const theme = context.theme
  const background = css(theme?.background ?? RULER_BG_COLOR, 1)
  const colors = {
    tick: css(theme?.tick ?? RULER_TICK_COLOR),
    text: css(theme?.text ?? RULER_TEXT_COLOR)
  }
  const { graph, view } = context
  const nodes = [...context.selectedIds]
    .map((id) => graph.getNode(id))
    .filter((node): node is SceneNode => !!node)
  const bounds =
    nodes.length > 0 ? computeAbsoluteBounds(nodes, (id) => graph.getAbsolutePosition(id)) : null
  const x = bounds && {
    start: bounds.x * view.zoom + view.panX,
    end: (bounds.x + bounds.width) * view.zoom + view.panX
  }
  const y = bounds && {
    start: bounds.y * view.zoom + view.panY,
    end: (bounds.y + bounds.height) * view.zoom + view.panY
  }
  const step = rulerStep(view.zoom)
  const shapes: OverlayShape[] = [
    { type: 'rect', x: 0, y: 0, width, height: R, fill: background },
    { type: 'rect', x: 0, y: R, width: R, height: height - R, fill: background },
    ...ticks(context, 'x', step, x, colors),
    ...ticks(context, 'y', step, y, colors)
  ]
  if (x && y) {
    const highlight = css(SELECTION_COLOR, RULER_HIGHLIGHT_ALPHA)
    const world = (screen: number, pan: number) => String(Math.round((screen - pan) / view.zoom))
    shapes.push(
      {
        type: 'rect',
        x: Math.max(R, x.start),
        y: 0,
        width: Math.max(0, x.end - Math.max(R, x.start)),
        height: R,
        fill: highlight
      },
      {
        type: 'rect',
        x: 0,
        y: Math.max(R, y.start),
        width: R,
        height: Math.max(0, y.end - Math.max(R, y.start)),
        fill: highlight
      },
      badge(context, world(x.start, view.panX), Math.max(R, x.start), 'x'),
      badge(context, world(x.end, view.panX), x.end, 'x'),
      badge(context, world(y.start, view.panY), Math.max(R, y.start), 'y'),
      badge(context, world(y.end, view.panY), y.end, 'y')
    )
  }
  // The corner square sits over both rulers' ends.
  shapes.push(
    { type: 'rect', x: 0, y: 0, width: R, height: R, fill: background },
    ...guidePositions(context)
  )
  return shapes
}
