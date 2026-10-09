import type {
  LabelCache,
  OverlayLayerId,
  PlacedIssueMarker,
  RulerTheme
} from '@open-pencil/core/canvas'
import { RULER_SIZE } from '@open-pencil/core/constants'
import type { Color, Rect } from '@open-pencil/scene-graph/primitives'

import { aiMarksLayer, type AIMarks } from '#vue/canvas/svg-overlay/layers/ai-marks'
import { autoLayoutHoverLayer } from '#vue/canvas/svg-overlay/layers/auto-layout-hover'
import { flashesLayer, type Flash } from '#vue/canvas/svg-overlay/layers/flashes'
import { guideRedlineLayer, guidesLayer } from '#vue/canvas/svg-overlay/layers/guides'
import {
  issueHighlightLayer,
  issueLayer,
  issueMarkersLayout
} from '#vue/canvas/svg-overlay/layers/issues'
import {
  componentLabelsLayer,
  frameTitlesLayer,
  sectionTitlesLayer
} from '#vue/canvas/svg-overlay/layers/labels'
import { measurementsLayer } from '#vue/canvas/svg-overlay/layers/measurement'
import {
  codeFocusLayer,
  componentSetBordersLayer,
  layoutOutlinesLayer,
  slotOutlinesLayer
} from '#vue/canvas/svg-overlay/layers/outlines'
import { pixelGridLayer } from '#vue/canvas/svg-overlay/layers/pixel-grid'
import { presenceLayer } from '#vue/canvas/svg-overlay/layers/presence'
import { rulersLayer } from '#vue/canvas/svg-overlay/layers/rulers'
import {
  dropTargetLayer,
  enteredContainerLayer,
  hoverLayer,
  insertIndicatorLayer,
  marqueeLayer,
  selectionLayer,
  snapGuidesLayer,
  type OverlayContext
} from '#vue/canvas/svg-overlay/layers/selection'
import { nodeEditLayer, penLayer } from '#vue/canvas/svg-overlay/layers/vector-edit'
import type { OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/**
 * The overlays this backend draws; the Skia overlay canvas leaves them out. What is still Skia's:
 * the text caret (until text editing moves into the page), the live shape while editing a path,
 * AI activity marks and the profiler HUD.
 */
export const SVG_OVERLAY_LAYERS: ReadonlySet<OverlayLayerId> = new Set<OverlayLayerId>([
  'pixelGrid',
  'componentSetBorders',
  'codeFocus',
  'slotOutlines',
  'layoutOutlines',
  'hover',
  'issueHighlight',
  'selection',
  'enteredContainer',
  'dropTarget',
  'measurements',
  'flashes',
  'guideRedline',
  'guides',
  'marquee',
  'snapGuides',
  'layoutInsertIndicator',
  'autoLayoutHover',
  'nodeEdit',
  // The DOM scene redraws the path being edited from its live vertices.
  'nodeEditShape',
  // Text being edited is the page's own, caret and selection included.
  'textEdit',
  'pen',
  'issueMarkers',
  'presence',
  'frameTitles',
  'sectionTitles',
  'componentLabels',
  'rulers'
])

/** Everything a frame of the overlay depends on beyond the shared overlay context. */
export interface ComposeInput extends OverlayContext {
  pageId: string
  viewportSize: { width: number; height: number }
  dpr: number
  pageColor: Color
  labels: LabelCache
  showRulers: boolean
  rulerTheme?: RulerTheme | null
  /** UI floating over the canvas that edge-pinned markers keep clear of. */
  obstacles: readonly Rect[]
  flashes: readonly Flash[]
  /** Layers an agent works on or just finished. */
  aiMarks: AIMarks
  now: number
}

export interface ComposedOverlay {
  shapes: OverlayShape[]
  /** The issue markers as drawn, which pointer hit testing must use. */
  issueMarkers: PlacedIssueMarker[]
}

function measuring(context: OverlayContext): boolean {
  const { overlays } = context
  return (
    overlays.measurementMode !== undefined &&
    overlays.measurementMode !== 'off' &&
    !overlays.editingTextId &&
    !overlays.nodeEditState &&
    !overlays.penState
  )
}

/** Every SVG overlay for a frame, bottom to top, in the order the Skia passes draw them. */
export function composeOverlay(input: ComposeInput): ComposedOverlay {
  const rulers = input.showRulers ? rulersLayer({ ...input, theme: input.rulerTheme }) : []
  if (input.overlays.playing) return { shapes: rulers, issueMarkers: [] }
  const isMeasuring = measuring(input)
  const hovered =
    isMeasuring || input.overlays.hoveredNodeId === input.overlays.nodeEditState?.nodeId
      ? null
      : input.overlays.hoveredNodeId
  const inset = input.showRulers ? RULER_SIZE : 0
  const issueMarkers = issueMarkersLayout(
    input,
    { pageId: input.pageId, ...input.viewportSize },
    input.obstacles,
    { top: inset, left: inset }
  )
  const shapes = [
    // Labels, under the editing overlays.
    ...frameTitlesLayer(input),
    ...sectionTitlesLayer(input),
    ...componentLabelsLayer(input),
    // Structure, over the design and under every editing outline.
    ...pixelGridLayer(input, { ...input.viewportSize, dpr: input.dpr, pageColor: input.pageColor }),
    ...componentSetBordersLayer(input, input.pageId),
    ...codeFocusLayer(input),
    ...(isMeasuring ? [] : slotOutlinesLayer(input, hovered)),
    ...(isMeasuring ? [] : layoutOutlinesLayer(input, hovered)),
    ...hoverLayer(input, hovered),
    ...issueHighlightLayer(input),
    ...enteredContainerLayer(input),
    ...dropTargetLayer(input),
    ...selectionLayer(input),
    ...(isMeasuring ? measurementsLayer(input) : []),
    // Gesture feedback.
    ...aiMarksLayer(input, input.aiMarks, input.now),
    ...flashesLayer(input, input.flashes, input.now),
    ...guideRedlineLayer(input),
    ...guidesLayer(input, { pageId: input.pageId, ...input.viewportSize }),
    ...snapGuidesLayer(input),
    ...marqueeLayer(input),
    ...insertIndicatorLayer(input),
    ...(isMeasuring ? [] : autoLayoutHoverLayer(input)),
    // On top.
    ...nodeEditLayer(input),
    ...penLayer(input),
    ...issueLayer(input, issueMarkers, input.overlays.designIssues?.hoveredMarkerKey),
    ...presenceLayer(input),
    ...rulers
  ]
  return { shapes, issueMarkers }
}
