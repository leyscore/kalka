import type { Editor, MoveOriginal, ScaleSession, Tool } from '@kalka/core/editor'
import type {
  CSSDeclarations,
  DerivedTextGlyph,
  GeometryPath,
  NodeType,
  SceneNode,
  Stroke,
  TextPathData,
  VectorNetwork
} from '@kalka/scene-graph'
import type { Rect, Vector } from '@kalka/scene-graph/primitives'
import type { ResizeSnapshot } from '@kalka/scene-graph/resize'

import type { AutoLayoutValueField } from '#vue/shared/input/auto-layout-hover'

export type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export type CornerPosition = 'nw' | 'ne' | 'se' | 'sw'

export type CornerKey =
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomRightRadius'
  | 'bottomLeftRadius'

export type CornerRadii = Pick<SceneNode, CornerKey | 'cornerRadius' | 'independentCorners'>

/** A padding or the gap of an auto layout frame dragged on the canvas, as Figma's handles are. */
export interface DragAutoLayoutValue {
  type: 'auto-layout-value'
  nodeId: string
  /** The fields the drag sets: one padding, a pair with Option/Alt, or the gap. */
  fields: readonly AutoLayoutValueField[]
  /** The hover the drag keeps drawn, with its value. */
  hover: NonNullable<Editor['state']['autoLayoutHover']>
  /** The canvas axis that changes the value, and which way grows it. */
  axis: 'x' | 'y'
  direction: 1 | -1
  start: number
  startValue: number
  original: Partial<Pick<SceneNode, AutoLayoutValueField>>
}

/** A corner radius handle being dragged. */
export interface DragCornerRadius {
  type: 'corner-radius'
  nodeId: string
  corner: CornerPosition
  /** Option/Alt at the press: only this corner changes. */
  single: boolean
  /** How far into the layer the handle sat at the press. */
  startDepth: number
  startRadius: number
  original: CornerRadii
}

/** A gradient handle dragged on the canvas while its picker is open. */
export interface DragGradientHandle {
  type: 'gradient-handle'
  nodeId: string
  paint: 'fills' | 'strokes'
  index: number
  handle: 'start' | 'end' | 'width' | number
  /** The layer's paints at the press. */
  original: Pick<SceneNode, 'fills' | 'strokes'>
}

export interface DragDraw {
  type: 'draw'
  /** Start point in the parent's axes. */
  startX: number
  startY: number
  /** Maps a canvas point into the parent's axes. */
  toLocal: (x: number, y: number) => Vector
  /** A line is drawn by its length and angle, as in Figma, not as a box. */
  line?: boolean
  /** Lands a coordinate on the pixel grid while Snap to pixel grid is on. */
  snap: (value: number) => number
  nodeId: string
  update: (changes: Partial<SceneNode>) => void
  commit: () => void
  cancel: () => void
}

export interface DragMove {
  type: 'move'
  startX: number
  startY: number
  currentX: number
  currentY: number
  appliedDx: number
  appliedDy: number
  startScreenX: number
  startScreenY: number
  dragStarted: boolean
  originals: Map<string, MoveOriginal>
  duplicated?: boolean
  duplicatedPreviousSelection?: Set<string>
  autoLayoutParentId?: string
  brokeFromAutoLayout?: boolean
  /** Space is held: layers keep their parents wherever they are dropped. */
  keepParents?: boolean
  /** Control is held: auto layout frames take the layers as absolute-positioned children. */
  ignoreAutoLayout?: boolean
  /** Selected instead if the press ends as a click without dragging. */
  selectOnClick?: string
  /** Where Control drops layers among an auto layout frame's children. */
  absoluteInsertIndex?: number
}

export interface DragPan {
  type: 'pan'
  startScreenX: number
  startScreenY: number
  startPanX: number
  startPanY: number
}

export interface DragResize {
  type: 'resize'
  handle: HandlePosition
  startX: number
  startY: number
  origRect: Rect
  nodeId: string
  origVectorNetwork: VectorNetwork | null
  origFillGeometry: GeometryPath[]
  /** Path-text OUTSIDE outlines / vector stroke blobs — must scale with the node. */
  origStrokeGeometry: GeometryPath[]
  origDerivedTextGlyphs: DerivedTextGlyph[] | null
  origStrokes: Stroke[]
  origTextPathData: TextPathData | null
  origTextPathBox: Rect | null
  /** The layer's CSS before the resize, which the resize may let give way. */
  origStyle: CSSDeclarations
  origChildren: Map<string, ResizeSnapshot> | null
  appliedRect?: Rect
}

export interface DragMarquee {
  type: 'marquee'
  startX: number
  startY: number
  /** The open frame or section the marquee started in, whose layers it selects. */
  containerId?: string
}

export interface DragRotate {
  type: 'rotate'
  nodeId: string
  centerX: number
  centerY: number
  startAngle: number
  origRotation: number
  rotationDirection: 1 | -1
}

/** A handle dragged with the Scale tool (K): the selection scales about the opposite handle. */
export interface DragScale {
  type: 'scale'
  session: ScaleSession
  /** The opposite handle, which stays put, and the grabbed one, on the page. */
  anchor: Vector
  handle: Vector
}

/** A drag across the Shape builder's regions: those it crossed are merged, or removed with Alt. */
export interface DragShapeBuilder {
  type: 'shape-builder'
  picked: number[]
  remove: boolean
}

/** A freehand stroke the pencil is drawing; the points live in the editor state. */
export interface DragPencil {
  type: 'pencil'
}

export interface DragPen {
  type: 'pen-drag'
  startX: number
  startY: number
  modifierMode: 'default' | 'continuous' | 'independent'
  frozenOppositeTangent: Vector | null
  spaceDown: boolean
  spaceStartX: number
  spaceStartY: number
  knotStartX: number
  knotStartY: number
}

export interface DragTextSelect {
  type: 'text-select'
  startX: number
  startY: number
}

export interface DragEditNode {
  type: 'edit-node'
  startX: number
  startY: number
  origPositions: Map<number, Vector>
}

export interface DragEditHandle {
  type: 'edit-handle'
  segmentIndex: number
  tangentField: 'tangentStart' | 'tangentEnd'
  vertexIndex: number
  startX: number
  startY: number
  initialTangent: Vector | null
}

export interface DragBendHandle {
  type: 'bend-handle'
  vertexIndex: number
  startX: number
  startY: number
  lockedMode: 'symmetric' | 'independent' | null
  dragSamples: Vector[]
  targetSegmentIndex: number | null
  targetTangentField: 'tangentStart' | 'tangentEnd' | null
}

export interface DragGuide {
  type: 'guide'
  axis: 'x' | 'y'
  ownerId: string
  position: number
  startScreenX: number
  startScreenY: number
  currentScreenX: number
  currentScreenY: number
  dragStarted: boolean
  duplicate?: boolean
  guideId?: string
  originalOwnerId?: string
  originalPosition?: number
}

/** A prototype connection dragged out of the selected layer's handle. */
export interface DragPrototypeLink {
  type: 'prototype-link'
  sourceId: string
}

export type DragState =
  | DragDraw
  | DragMove
  | DragPan
  | DragResize
  | DragMarquee
  | DragRotate
  | DragPen
  | DragPencil
  | DragScale
  | DragShapeBuilder
  | DragTextSelect
  | DragEditNode
  | DragEditHandle
  | DragBendHandle
  | DragGuide
  | DragCornerRadius
  | DragGradientHandle
  | DragAutoLayoutValue
  | DragPrototypeLink

export const TOOL_TO_NODE: Partial<Record<Tool, NodeType>> = {
  FRAME: 'FRAME',
  SECTION: 'SECTION',
  RECTANGLE: 'RECTANGLE',
  ELLIPSE: 'ELLIPSE',
  LINE: 'LINE',
  ARROW: 'LINE',
  POLYGON: 'POLYGON',
  STAR: 'STAR',
  TEXT: 'TEXT'
}
