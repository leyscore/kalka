import type { CanvasKit } from 'canvaskit-wasm'

import type {
  CharacterStyleOverride,
  DocumentColorSpace,
  SceneGraph,
  SceneGraphEvents,
  SceneNode,
  TextHyperlink,
  TextListType,
  VectorSegment,
  VectorVertex
} from '@kalka/scene-graph'
import type { CanvasGuide } from '@kalka/scene-graph/guides'
import type { Color, Rect, Vector } from '@kalka/scene-graph/primitives'
import type { SnapGuide } from '@kalka/scene-graph/snap'
import type { UndoManager } from '@kalka/scene-graph/undo'

import type { GuideOverlayState } from '#core/canvas/guides/types'
import type { DesignIssueOverlay } from '#core/canvas/issues/types'
import type { RulerTheme, SkiaRenderer } from '#core/canvas/renderer'
import type {
  CornerRadiusHandleState,
  BlurEditState,
  GradientEditState,
  MeasurementMode,
  OutlineMode,
  PixelPreview,
  PresenceCursor,
  RenderOverlays
} from '#core/canvas/renderer/types'
import type { InterfaceTheme } from '#core/constants'
import type { PlayState } from '#core/editor/play/actions'
import type { PrototypeLinkDrag } from '#core/editor/play/connections'
import type { SnappingPreferences } from '#core/editor/preferences'
import type { DefaultLayerProperties } from '#core/editor/shapes/default-properties'
import type { RotationPreview } from '#core/geometry'
import type { IconProvider } from '#core/icons/provider'
import type { TextEditor } from '#core/text/editor'
import type { FontResolutionEvent, FontResolutionSnapshot } from '#core/text/resolver'

export type Tool =
  | 'SELECT'
  | 'FRAME'
  | 'SECTION'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'LINE'
  | 'ARROW'
  | 'POLYGON'
  | 'STAR'
  | 'TEXT'
  | 'PEN'
  | 'PENCIL'
  | 'SCALE'
  | 'SHAPE_BUILDER'
  | 'HAND'

export interface EditorSharedState {
  activeTool: Tool
  snappingPreferences: SnappingPreferences
  /** Draw the pixel grid once zoomed in far enough, as Figma's View › Pixel grid; shown unless false. */
  showPixelGrid?: boolean
  /** Draw frames' layout grids, as Figma's View › Layout grids; shown unless false. */
  showLayoutGrids?: boolean
  /** Figma's View › Outlines: layers drawn as thin outlines, all of them or the selection. */
  outlineMode?: OutlineMode | null
  /** Outline mode outlines hidden layers too. */
  outlineHiddenLayers?: boolean
  /** Outline mode outlines the boxes of text too, not only its glyphs. */
  outlineObjectBounds?: boolean
  /** Figma's View › Mask outlines. */
  showMaskOutlines?: boolean
  /** Figma's View › Frame outlines. */
  showFrameOutlines?: boolean
  /** Figma's View › Pixel preview, off unless set. */
  pixelPreview?: PixelPreview | null
  /** The Prototype tab is open: the canvas draws prototype connections. */
  prototyping?: boolean
  /**
   * The document is open to view only, such as a server file shared to view: people look, select,
   * inspect and export, and nothing they do edits it. Only the select and hand tools are offered.
   */
  viewOnly?: boolean
  presenceCursors: PresenceCursor[]
  documentName: string
  /** Design check markers and highlight, shared by every canvas pane. */
  designIssues: DesignIssueOverlay | null
  /** The layer of the code element around the cursor in a code editor, shown in every pane. */
  codeFocusNodeId: string | null
  rulerTheme?: RulerTheme
  /** Figma's Keep tool selected after use: a drawing tool stays active after it draws. */
  keepToolSelected?: boolean
  /** Figma's Rename duplicated layers: Duplicate numbers the copy, Rectangle 1 then 2. */
  renameDuplicates?: boolean
  /** The look new shapes and texts take, set by Figma's Set default properties. */
  defaultLayerProperties?: DefaultLayerProperties
  /** The interface theme new sections take their fill from; light when unset. */
  theme?: InterfaceTheme
  /** Bumped by every document change; views, saving, and recovery follow it. */
  sceneVersion: number
  /**
   * Bumped by document changes the canvas draws. Changes it does not draw, such as a variable's
   * name or CSS name, bump only `sceneVersion`, so the canvas keeps its recorded pictures.
   */
  canvasVersion: number
}

/** What the Shape builder draws: each region's outline, the hovered one and those picked. */
export interface ShapeBuilderOverlay {
  /** SVG path data on the page. */
  outlines: string[]
  hovered: number | null
  picked: number[]
  /** The picked regions are being removed (Option/Alt), not merged. */
  removing: boolean
}

export interface EditorViewState {
  currentPageId: string
  selectedIds: Set<string>
  marquee: Rect | null
  snapGuides: SnapGuide[]
  guides: GuideOverlayState
  rotationPreview: RotationPreview | null
  dropTargetId: string | null
  layoutInsertIndicator: {
    parentId: string
    index: number
    x: number
    y: number
    length: number
    direction: 'HORIZONTAL' | 'VERTICAL'
  } | null
  hoveredNodeId: string | null
  /** A pointer move, resize, or rotation is in progress. */
  transforming: boolean
  measurementMode: MeasurementMode
  editingTextId: string | null
  penState: {
    vertices: VectorVertex[]
    segments: VectorSegment[]
    dragTangent: Vector | null
    oppositeDragTangent: Vector | null
    pendingClose?: boolean
    closingToFirst: boolean
    resumingNodeId?: string
    resumedFills?: SceneNode['fills']
    resumedStrokes?: SceneNode['strokes']
  } | null
  penCursorX: number | null
  penCursorY: number | null
  /** The pencil's stroke while it is drawn, page-absolute. */
  pencilStroke: Vector[] | null
  /** The Shape builder's regions while the tool is on. */
  shapeBuilder: ShapeBuilderOverlay | null
  autoLayoutHover: {
    nodeId: string
    kind: 'frame' | 'children' | 'spacing' | 'spacing-value' | 'padding' | 'padding-value'
    index?: number
    side?: 'top' | 'right' | 'bottom' | 'left'
  } | null
  /** The selected layer under the pointer, with the corner radius handle hovered or dragged. */
  cornerRadiusHandle: CornerRadiusHandleState | null
  /** The gradient paint whose picker is open, with its handles drawn on the layer. */
  gradientEdit: GradientEditState | null
  /** The progressive blur whose settings are open, with its ends drawn on the layer. */
  blurEdit: BlurEditState | null
  panX: number
  pageColor: Color
  panY: number
  zoom: number
  navigation: NavigationState
  renderVersion: number
  enteredContainerId: string | null
  nodeEditState?: RenderOverlays['nodeEditState'] | null
  cursorCanvasX?: number | null
  cursorCanvasY?: number | null
  /** This canvas's preview, or null while it edits. */
  play: PlayState | null
  /** A prototype connection being dragged out of a layer. */
  prototypeLink?: PrototypeLinkDrag | null
}

export type NavigationPhase = 'idle' | 'pan' | 'zoom' | 'momentum' | 'settling'

export interface NavigationState {
  phase: NavigationPhase
  generation: number
  lastInputAt: number
}

export interface EditorState extends EditorSharedState, EditorViewState {}

export interface ClipboardImageResolution {
  total: number
  missing: number
  fetchAttempted: boolean
}

export type FigmaClipboardImageResolver = (
  fileKey: string,
  hashes: string[]
) => Promise<ReadonlyMap<string, Uint8Array>>

export interface EditorEvents extends SceneGraphEvents {
  'render:requested': (versions: { renderVersion: number; sceneVersion: number }) => void
  'repaint:requested': (versions: { renderVersion: number; sceneVersion: number }) => void
  'graph:replaced': (graph: SceneGraph) => void
  'document:color-space-changed': (colorSpace: DocumentColorSpace) => void
  'history:changed': () => void
  'selection:changed': (selectedIds: string[], previousIds: string[]) => void
  'rotation:preview-changed': (preview: RotationPreview | null) => void
  'tool:changed': (tool: Tool, previousTool: Tool) => void
  'page:changed': (pageId: string, previousPageId: string) => void
  'guides:changed': (ownerId: string, guides: readonly CanvasGuide[]) => void
  'clipboard:images-missing': (resolution: ClipboardImageResolution) => void
  'font:resolution-changed': (event: FontResolutionEvent, snapshot: FontResolutionSnapshot) => void
  'viewport:changed': (
    viewport: { panX: number; panY: number; zoom: number },
    previous: { panX: number; panY: number; zoom: number }
  ) => void
  'navigation:changed': (navigation: NavigationState, previous: NavigationState) => void
  /** Figma's Collapse layers (Option+L): the layers panel folds every layer. */
  'layers:collapse-requested': () => void
}

export type EditorEventName = keyof EditorEvents

export interface EditorOptions {
  graph?: SceneGraph
  state?: EditorState
  loadFont?: (
    family: string,
    style: string,
    characters?: string,
    signal?: AbortSignal
  ) => Promise<ArrayBuffer | null>
  resolveFigmaClipboardImages?: FigmaClipboardImageResolver
  getViewportSize?: () => { width: number; height: number }
  /** Where icons are searched and fetched; defaults to Iconify. */
  icons?: IconProvider
  skipInitialGraphSetup?: boolean
}

/** What pointer input does to the text being edited: place, extend or widen the selection. */
export interface TextCaretControl {
  selectAll(): void
  /** Node-local coordinates. */
  selectWordAt(x: number, y: number): void
  /** Node-local coordinates; `extend` keeps the anchor, as a shift-click or a drag does. */
  setCursorAt(x: number, y: number, extend?: boolean): void
}

/**
 * Text editing done outside the canvas renderer, such as the DOM scene's editor in the page.
 * While installed, the editor's own text engine stays idle: this edits the layer in place and
 * keeps its `text` and `styleRuns` up to date in the graph as the user types.
 */
export interface ExternalTextEditor extends TextCaretControl {
  start(nodeId: string): void
  /** Ends the edit; the graph already holds what was typed. */
  stop(): void
  /**
   * Gives the selected characters this style, as Figma does with a range selected; false when
   * no characters are selected, so the change belongs to the whole layer.
   */
  styleSelection?(style: CharacterStyleOverride): boolean
  /** Sets the list of the paragraphs the selection touches, or takes them out of it. */
  listSelection?(type: TextListType): boolean
  /**
   * The link the selection starts in, null outside any link. A caret in a link selects the whole
   * link, as Figma does before editing it.
   */
  selectLink?(): TextHyperlink | null
  /** Gives the text being edited the keyboard again, as after a dialog opened over it. */
  focus?(): void
}

export interface EditorContext {
  get graph(): SceneGraph
  set graph(g: SceneGraph)
  undo: UndoManager
  state: EditorState
  loadFont: (
    family: string,
    style: string,
    characters?: string,
    signal?: AbortSignal
  ) => Promise<ArrayBuffer | null>
  resolveFigmaClipboardImages: FigmaClipboardImageResolver | null
  getViewportSize: () => { width: number; height: number }
  icons: IconProvider
  getCk: () => CanvasKit | null
  getRenderer: () => SkiaRenderer | null
  getTextEditor: () => TextEditor | null
  getExternalTextEditor: () => ExternalTextEditor | null
  requestRender: () => void
  /** A document change the canvas does not draw: views and saving follow, nothing is redrawn. */
  requestRefresh: () => void
  requestRepaint: () => void
  beginInteractiveEdit: () => () => void
  onEditorEvent: <K extends EditorEventName>(event: K, handler: EditorEvents[K]) => () => void
  emitEditorEvent: <K extends EditorEventName>(
    event: K,
    ...args: Parameters<EditorEvents[K]>
  ) => void
  setSelectedIds: (ids: Set<string>) => void
  setActiveTool: (tool: Tool) => void
  setNavigationPhase: (phase: NavigationPhase, inputAt?: number) => void
  runLayoutForNode: (id: string) => void
  runMutationWithLayout: <T>(
    operation: () => T | Promise<T>,
    fallbackId?: string,
    beforeLayout?: (result: T) => Promise<void> | void
  ) => Promise<T>
  subscribeToGraph: () => void
}
