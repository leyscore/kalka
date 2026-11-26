import type { VectorRegion, VectorVertex } from '@kalka/scene-graph'
import type { Color, Rect, Vector } from '@kalka/scene-graph/primitives'
import type { SnapGuide } from '@kalka/scene-graph/snap'

import type { GuideOverlayState } from '#core/canvas/guides/types'
import type { DesignIssueOverlay } from '#core/canvas/issues/types'
import type { RotationPreview } from '#core/geometry'
import type { TextEditor } from '#core/text/editor'

export interface RulerTheme {
  background: Color
  tick: Color
  text: Color
  label: Color
}

export type MeasurementMode = 'off' | 'shallow' | 'deep'

/** Where a collaborator or an agent is working, in world coordinates. */
export interface PresenceCursor {
  /** Who it is, kept between updates; editors use it to glide a cursor rather than jump it. */
  id?: string
  kind: 'person' | 'agent'
  name: string
  /** A person's color, or the color of the person who runs the agent. */
  color: Color
  x: number
  y: number
  selection?: string[]
  /** Outlines in world coordinates of what is not a layer yet, such as streamed JSX. */
  outline?: Rect[]
}

export interface RenderOverlays {
  /** Whether the canvas previews: it draws the design without labels or editing outlines. */
  playing?: boolean
  /** Nodes a previewing canvas draws from its preview session instead of the document. */
  /** Layers a previewing canvas leaves to its live islands. */
  playIslands?: ReadonlySet<string>
  hoveredNodeId?: string | null
  /** Draw the pixel grid when zoomed in far enough. */
  showPixelGrid?: boolean
  /** Draw frames' layout grids; drawn unless false. */
  showLayoutGrids?: boolean
  transforming?: boolean
  measurementMode?: MeasurementMode
  enteredContainerId?: string | null
  editingTextId?: string | null
  textEditor?: TextEditor | null
  marquee?: Rect | null
  snapGuides?: SnapGuide[]
  guides?: GuideOverlayState
  rotationPreview?: RotationPreview | null
  dropTargetId?: string | null
  layoutInsertIndicator?: {
    x: number
    y: number
    length: number
    direction: 'HORIZONTAL' | 'VERTICAL'
  } | null
  autoLayoutHover?: {
    nodeId: string
    kind: 'frame' | 'children' | 'spacing' | 'spacing-value' | 'padding' | 'padding-value'
    index?: number
    side?: 'top' | 'right' | 'bottom' | 'left'
  } | null
  penState?: {
    vertices: Vector[]
    segments: Array<{
      start: number
      end: number
      tangentStart: Vector
      tangentEnd: Vector
    }>
    dragTangent: Vector | null
    oppositeDragTangent?: Vector | null
    closingToFirst: boolean
    pendingClose?: boolean
    cursorX?: number
    cursorY?: number
  } | null
  /** The pencil's stroke while it is drawn, page-absolute. */
  pencilStroke?: Vector[] | null
  nodeEditState?: {
    nodeId: string
    vertices: VectorVertex[]
    segments: Array<{
      start: number
      end: number
      tangentStart: Vector
      tangentEnd: Vector
    }>
    regions: VectorRegion[]
    selectedVertexIndices: Set<number>
    selectedHandles?: Set<number>
    hoveredHandleInfo?: { segmentIndex: number; tangentField: 'tangentStart' | 'tangentEnd' } | null
  } | null
  presenceCursors?: PresenceCursor[]
  designIssues?: DesignIssueOverlay | null
  codeFocusNodeId?: string | null
  /** The selected layer under the pointer, with the corner radius handle hovered or dragged. */
  cornerRadiusHandle?: CornerRadiusHandleState | null
  /** The gradient paint whose picker is open, which shows its handles on the layer. */
  gradientEdit?: GradientEditState | null
}

/**
 * A gradient handle: the start or end of the gradient line (the centre and the edge of a radial
 * one), the width of a radial, angular, or diamond gradient, or a color stop by its index.
 */
export type GradientHandle = 'start' | 'end' | 'width' | number

/**
 * The gradient paint being edited in its picker, which Figma draws on the layer with a handle at
 * each end of the gradient line and one per color stop.
 */
export interface GradientEditState {
  nodeId: string
  paint: 'fills' | 'strokes'
  index: number
  /** The stop selected in the picker. */
  activeStop: number
  /** The handle under the pointer or being dragged. */
  handle: GradientHandle | null
  dragging: boolean
}

/**
 * The pointer over the selected layer, which shows its corner radius handles as in Figma: the
 * handle it is on, if any, and whether that handle is being dragged.
 */
export interface CornerRadiusHandleState {
  nodeId: string
  corner: 'nw' | 'ne' | 'se' | 'sw' | null
  /** Being dragged, which shows the radius in a label. */
  dragging: boolean
}

/**
 * Overlays another backend draws instead of the Skia overlay canvas, such as the DOM scene's
 * SVG overlay. The Skia pass skips them.
 */
export type OverlayLayerId =
  | 'pixelGrid'
  | 'componentSetBorders'
  | 'codeFocus'
  | 'slotOutlines'
  | 'layoutOutlines'
  | 'hover'
  | 'issueHighlight'
  | 'selection'
  | 'enteredContainer'
  | 'dropTarget'
  | 'measurements'
  | 'flashes'
  | 'guideRedline'
  | 'guides'
  | 'marquee'
  | 'snapGuides'
  | 'layoutInsertIndicator'
  | 'autoLayoutHover'
  | 'nodeEdit'
  | 'nodeEditShape'
  | 'textEdit'
  | 'pen'
  | 'issueMarkers'
  | 'presence'
  | 'frameTitles'
  | 'sectionTitles'
  | 'componentLabels'
  | 'rulers'
