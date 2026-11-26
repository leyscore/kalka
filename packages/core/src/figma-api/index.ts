import { fromUint8Array, isValid, toUint8Array } from 'js-base64'

import type {
  GroupFitOptions,
  SceneGraph,
  NodeType,
  Variable,
  VariableCollection,
  VariableType,
  VariableValue
} from '@kalka/scene-graph'
import { computeImageHash } from '@kalka/scene-graph/images'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { SkiaRenderer } from '#core/canvas'
import { groupFitOptions } from '#core/canvas/boolean'
import type { InterfaceTheme } from '#core/constants'
import { wrapNodes } from '#core/editor/structure/container-wrap'
import { ungroupNode } from '#core/editor/structure/group'
import { setDefaultPageBackground } from '#core/figma-api/page-backgrounds'
import { iconify, type IconProvider } from '#core/icons'
import type { RasterCodec } from '#core/io/formats/raster'
import { createSVGNodes } from '#core/io/formats/svg'
import { reconcileVariableLayouts } from '#core/layout/variables'
import { documentFontStatus, type DocumentFontStatus } from '#core/text/font/status'
import { loadDocumentFont } from '#core/text/prepare'

import type { AgentAnswer, AgentQuestion, PlannedSection } from './agent'
import { combineComponentsAsVariants, componentFromNode, exposeInstanceSwap } from './components'
import { createPluginLayer } from './create'
import type {
  FigmaBooleanOperationNode,
  FigmaComponentNode,
  FigmaComponentSetNode,
  FigmaEllipseNode,
  FigmaFrameNode,
  FigmaGroupNode,
  FigmaLineNode,
  FigmaPolygonNode,
  FigmaRectangleNode,
  FigmaSectionNode,
  FigmaStarNode,
  FigmaTextNode,
  FigmaVectorNode
} from './node-types'
import {
  booleanOperationOf,
  flattenOf,
  nodeIdOf,
  rawNodeOf,
  type BooleanOperationType
} from './operations'
import { startPendingLayout } from './pending-layout'
import {
  FigmaNodeProxy,
  INTERNAL_ID,
  MIXED,
  type FigmaFont,
  type FigmaFontName,
  type NodeProxyHost
} from './proxy'
import { FigmaStylesAPI } from './styles'
import type { ExportImageOptions } from './types'
import { FigmaVariablesAPI } from './variables'
import { figmaViewport, type FigmaViewport, type ViewportState } from './viewport'

const noop = () => undefined

export { FigmaNodeProxy } from './proxy'
export type {
  AgentAnswer,
  AgentAnswerImage,
  AgentQuestion,
  AgentQuestionImage,
  PlannedSection
} from './agent'
export { UNSUPPORTED_PLUGIN_API, type UnsupportedPluginAPIMember } from './unsupported'
export { flushPendingLayout } from './pending-layout'
export type { FigmaEffect } from './effects'
export type { ExportImageOptions } from './types'
// Every Figma node type over Kalka's proxy, as `figma.create*` returns them.
export type * from './node-types'
export type { FigmaFont, FigmaFontName } from './proxy'
export type {
  FigmaVariable,
  FigmaVariableAlias,
  FigmaVariableCollection,
  FigmaVariablesAPI,
  FigmaVariableValue
} from './variables'

export { computeImageHash }

// TODO(figma-api): Implement the full official PluginAPI interface once our compatibility
// layer covers all required node-specific return types and unsupported APIs are modeled explicitly.
export class FigmaAPI implements NodeProxyHost {
  readonly graph: SceneGraph
  private _currentPageId: string
  private _selection: FigmaNodeProxy[] = []
  private _nodeCache = new Map<string, FigmaNodeProxy>()
  private _pageProxies = new WeakSet<FigmaNodeProxy>()
  private _renderer: SkiaRenderer | null = null
  /** The interface theme new sections take their fill from, as in Figma. */
  theme: InterfaceTheme = 'light'

  readonly mixed = MIXED
  readonly variables: FigmaVariablesAPI = new FigmaVariablesAPI(this)
  private readonly _styles = new FigmaStylesAPI(this)

  constructor(graph: SceneGraph) {
    this.graph = graph
    startPendingLayout(graph)
    const pages = graph.getPages()
    this._currentPageId = pages[0]?.id ?? graph.rootId
  }

  setRenderer(renderer: SkiaRenderer | null): void {
    this._renderer = renderer
  }

  get groupFitOptions(): GroupFitOptions {
    return groupFitOptions(this._renderer, this.graph)
  }

  get currentPageId(): string {
    return this._currentPageId
  }

  wrapNode(id: string): FigmaNodeProxy {
    let proxy = this._nodeCache.get(id)
    if (!proxy) {
      proxy = new FigmaNodeProxy(id, this.graph, this)
      this._nodeCache.set(id, proxy)
    }
    return proxy
  }

  private _ensurePageProxy(
    proxy: FigmaNodeProxy
  ): FigmaNodeProxy & { selection: FigmaNodeProxy[] } {
    if (!this._pageProxies.has(proxy)) {
      Object.defineProperty(proxy, 'selection', {
        get: () => this._selection,
        set: (nodes: FigmaNodeProxy[]) => {
          this._selection = nodes
        },
        enumerable: true,
        configurable: true
      })
      this._pageProxies.add(proxy)
    }
    return proxy as FigmaNodeProxy & { selection: FigmaNodeProxy[] }
  }

  get root(): FigmaNodeProxy {
    return this.wrapNode(this.graph.rootId)
  }

  get currentPage(): FigmaNodeProxy & { selection: FigmaNodeProxy[] } {
    return this._ensurePageProxy(this.wrapNode(this._currentPageId))
  }

  set currentPage(page: FigmaNodeProxy) {
    this._currentPageId = page[INTERNAL_ID]
  }

  /** Every page is loaded in Kalka, so switching pages is immediate. */
  async setCurrentPageAsync(page: FigmaNodeProxy): Promise<void> {
    if (this.graph.getNode(page[INTERNAL_ID])?.type !== 'CANVAS') {
      throw new Error('in setCurrentPageAsync: The node is not a page')
    }
    this.currentPage = page
  }

  async loadAllPagesAsync(): Promise<void> {
    return undefined
  }

  getNodeById(id: string): FigmaNodeProxy | null {
    const node = this.graph.getNode(id)
    return node ? this.wrapNode(id) : null
  }

  /** The async lookup that Figma requires in dynamic-page mode; same result as getNodeById. */
  async getNodeByIdAsync(id: string): Promise<FigmaNodeProxy | null> {
    return this.getNodeById(id)
  }

  // --- Node Creation ---

  /** New layers start as the editor's tools make them, which is how Figma's plugin API makes them. */
  private _createNode(type: NodeType): FigmaNodeProxy {
    return this.wrapNode(createPluginLayer(this.graph, type, this._currentPageId, this.theme))
  }

  createFrame(): FigmaFrameNode {
    return this._createNode('FRAME') as FigmaFrameNode
  }

  createRectangle(): FigmaRectangleNode {
    return this._createNode('RECTANGLE') as FigmaRectangleNode
  }

  createEllipse(): FigmaEllipseNode {
    return this._createNode('ELLIPSE') as FigmaEllipseNode
  }

  createText(): FigmaTextNode {
    return this._createNode('TEXT') as FigmaTextNode
  }

  createLine(): FigmaLineNode {
    return this._createNode('LINE') as FigmaLineNode
  }

  createPolygon(): FigmaPolygonNode {
    return this._createNode('POLYGON') as FigmaPolygonNode
  }

  createStar(): FigmaStarNode {
    return this._createNode('STAR') as FigmaStarNode
  }

  createVector(): FigmaVectorNode {
    return this._createNode('VECTOR') as FigmaVectorNode
  }

  /** The layers Figma makes from SVG markup, on the current page at its origin. */
  // eslint-disable-next-line kalka/no-mixed-case-acronym-identifiers -- Figma Plugin API name.
  createNodeFromSvg(svg: string): FigmaFrameNode {
    const node = createSVGNodes(this.graph, this._currentPageId, svg, { keepEmpty: true })
    if (!node) throw new Error('in createNodeFromSvg: Failed to convert SVG file')
    return this.wrapNode(node.id) as FigmaFrameNode
  }

  createComponent(): FigmaComponentNode {
    return this._createNode('COMPONENT') as FigmaComponentNode
  }

  createSection(): FigmaSectionNode {
    return this._createNode('SECTION') as FigmaSectionNode
  }

  createPage(): FigmaNodeProxy {
    const page = this.graph.addPage('Page')
    setDefaultPageBackground(this.graph, page, this.theme)
    return this.wrapNode(page.id)
  }

  // --- Grouping ---

  group(
    nodes: ReadonlyArray<FigmaNodeProxy>,
    parent: FigmaNodeProxy,
    index?: number
  ): FigmaGroupNode
  group(nodes: ReadonlyArray<BaseNode>, parent: BaseNode & ChildrenMixin, index?: number): GroupNode
  group(
    nodes: ReadonlyArray<BaseNode | FigmaNodeProxy>,
    parent: (BaseNode & ChildrenMixin) | FigmaNodeProxy,
    index?: number
  ): FigmaGroupNode {
    const parentId = nodeIdOf(parent)
    const members = nodes.map((node) => rawNodeOf(this.graph, node))
    const groupNode = wrapNodes(this.graph, 'GROUP', members, parentId, index)
    return this.wrapNode(groupNode.id) as FigmaGroupNode
  }

  ungroup(node: FigmaNodeProxy): FigmaNodeProxy[]
  ungroup(node: SceneNode & ChildrenMixin): Array<SceneNode>
  ungroup(node: (SceneNode & ChildrenMixin) | FigmaNodeProxy): Array<SceneNode> | FigmaNodeProxy[] {
    const children = ungroupNode(this.graph, nodeIdOf(node)) ?? []
    return children.map((id) => this.wrapNode(id))
  }

  createComponentFromNode(node: FigmaNodeProxy): FigmaNodeProxy {
    const raw = this.graph.getNode(node[INTERNAL_ID])
    if (!raw) throw new Error('Node not found')
    return this.wrapNode(componentFromNode(this.graph, raw, raw.parentId ?? this._currentPageId).id)
  }

  combineAsVariants(
    nodes: ReadonlyArray<FigmaComponentNode>,
    parent: FigmaNodeProxy,
    index?: number
  ): FigmaComponentSetNode
  combineAsVariants(
    nodes: ReadonlyArray<ComponentNode>,
    parent: BaseNode & ChildrenMixin,
    index?: number
  ): ComponentSetNode
  combineAsVariants(
    nodes: ReadonlyArray<ComponentNode | FigmaComponentNode>,
    parent: (BaseNode & ChildrenMixin) | FigmaNodeProxy,
    index?: number
  ): FigmaComponentSetNode {
    const componentSet = combineComponentsAsVariants(
      this.graph,
      nodes.map((node) => nodeIdOf(node)),
      nodeIdOf(parent),
      index
    )
    return this.wrapNode(componentSet.id) as FigmaComponentSetNode
  }

  exposeInstanceSwap(
    slots: ReadonlyArray<FigmaNodeProxy>,
    candidates: ReadonlyArray<FigmaNodeProxy>,
    propertyName = 'Instance'
  ): FigmaNodeProxy {
    const host = exposeInstanceSwap(this.graph, slots, candidates, propertyName)
    return this.wrapNode(host.id)
  }

  // --- Local styles, as Figma's PaintStyle, TextStyle, EffectStyle and GridStyle ---

  createPaintStyle = () => this._styles.create('PAINT')
  createTextStyle = () => this._styles.create('TEXT')
  createEffectStyle = () => this._styles.create('EFFECT')
  createGridStyle = () => this._styles.create('GRID')
  getLocalPaintStyles = () => this._styles.local('PAINT')
  getLocalTextStyles = () => this._styles.local('TEXT')
  getLocalEffectStyles = () => this._styles.local('EFFECT')
  getLocalGridStyles = () => this._styles.local('GRID')
  getLocalPaintStylesAsync = async () => this._styles.local('PAINT')
  getLocalTextStylesAsync = async () => this._styles.local('TEXT')
  getLocalEffectStylesAsync = async () => this._styles.local('EFFECT')
  getLocalGridStylesAsync = async () => this._styles.local('GRID')
  getStyleById = (id: string) => this._styles.byId(id)
  getStyleByIdAsync = async (id: string) => this._styles.byId(id)
  moveLocalPaintStyleAfter = (target: unknown, reference: unknown) =>
    this._styles.moveAfter('PAINT', target, reference)
  moveLocalTextStyleAfter = (target: unknown, reference: unknown) =>
    this._styles.moveAfter('TEXT', target, reference)
  moveLocalEffectStyleAfter = (target: unknown, reference: unknown) =>
    this._styles.moveAfter('EFFECT', target, reference)
  moveLocalGridStyleAfter = (target: unknown, reference: unknown) =>
    this._styles.moveAfter('GRID', target, reference)
  moveLocalPaintFolderAfter = (target: string, reference: string | null) =>
    this._styles.moveFolderAfter('PAINT', target, reference)
  moveLocalTextFolderAfter = (target: string, reference: string | null) =>
    this._styles.moveFolderAfter('TEXT', target, reference)
  moveLocalEffectFolderAfter = (target: string, reference: string | null) =>
    this._styles.moveFolderAfter('EFFECT', target, reference)
  moveLocalGridFolderAfter = (target: string, reference: string | null) =>
    this._styles.moveFolderAfter('GRID', target, reference)

  getVariableById(id: string): Variable | null {
    return this.graph.variables.get(id) ?? null
  }

  getLocalVariables(type?: string): Variable[] {
    const vars = [...this.graph.variables.values()]
    if (type) return vars.filter((v) => v.type === type)
    return vars
  }

  getLocalVariableCollections(): VariableCollection[] {
    return [...this.graph.variableCollections.values()]
  }

  getVariableCollectionById(id: string): VariableCollection | null {
    return this.graph.variableCollections.get(id) ?? null
  }

  // --- Variable/Collection CRUD ---

  createVariable(
    name: string,
    type: VariableType,
    collectionId: string,
    value?: VariableValue
  ): Variable {
    return this.graph.createVariable(name, type, collectionId, value)
  }

  setVariableValue(variableId: string, modeId: string, value: VariableValue): void {
    const variable = this.graph.variables.get(variableId)
    if (!variable) throw new Error(`Variable "${variableId}" not found`)
    variable.valuesByMode[modeId] = structuredClone(value)
    reconcileVariableLayouts(this.graph, { variables: [variableId] })
  }

  deleteVariable(id: string): void {
    this.graph.removeVariable(id)
  }

  createVariableCollection(name: string): VariableCollection {
    return this.graph.createCollection(name)
  }

  deleteVariableCollection(id: string): void {
    this.graph.removeCollection(id)
  }

  bindVariable(nodeId: string, field: string, variableId: string): void {
    this.graph.bindVariable(nodeId, field, variableId)
    reconcileVariableLayouts(this.graph, { subtrees: [nodeId] })
  }

  unbindVariable(nodeId: string, field: string): void {
    this.graph.unbindVariable(nodeId, field)
    reconcileVariableLayouts(this.graph, { subtrees: [nodeId] })
  }

  // --- Boolean Operations ---

  private _booleanOperation(
    operation: BooleanOperationType,
    nodes: ReadonlyArray<BaseNode | FigmaNodeProxy>,
    parent: (BaseNode & ChildrenMixin) | FigmaNodeProxy,
    index?: number
  ): FigmaBooleanOperationNode {
    const fit = this.groupFitOptions
    const id = booleanOperationOf(this.graph, operation, nodes, nodeIdOf(parent), index, fit)
    return this.wrapNode(id) as FigmaBooleanOperationNode
  }

  private _nodesById(nodeIds: string[]) {
    return nodeIds.map((id) => {
      const node = this.getNodeById(id)
      if (!node) throw new Error(`Node ${id} not found`)
      return node
    })
  }

  booleanOperation(operation: BooleanOperationType, nodeIds: string[]): FigmaBooleanOperationNode {
    const first = this.graph.getNode(nodeIds[0])
    const parent = this.wrapNode(first?.parentId ?? this._currentPageId)
    return this._booleanOperation(operation, this._nodesById(nodeIds), parent)
  }

  union(
    nodes: ReadonlyArray<BaseNode>,
    parent: BaseNode & ChildrenMixin,
    index?: number
  ): BooleanOperationNode {
    return this._booleanOperation('UNION', nodes, parent, index)
  }

  subtract(
    nodes: ReadonlyArray<BaseNode>,
    parent: BaseNode & ChildrenMixin,
    index?: number
  ): BooleanOperationNode {
    return this._booleanOperation('SUBTRACT', nodes, parent, index)
  }

  intersect(
    nodes: ReadonlyArray<BaseNode>,
    parent: BaseNode & ChildrenMixin,
    index?: number
  ): BooleanOperationNode {
    return this._booleanOperation('INTERSECT', nodes, parent, index)
  }

  exclude(
    nodes: ReadonlyArray<BaseNode>,
    parent: BaseNode & ChildrenMixin,
    index?: number
  ): BooleanOperationNode {
    return this._booleanOperation('EXCLUDE', nodes, parent, index)
  }

  // --- Flatten ---

  flatten(
    nodes: ReadonlyArray<FigmaNodeProxy>,
    parent?: FigmaNodeProxy,
    index?: number
  ): FigmaVectorNode
  flatten(
    nodes: ReadonlyArray<BaseNode>,
    parent?: BaseNode & ChildrenMixin,
    index?: number
  ): VectorNode
  flatten(
    nodes: ReadonlyArray<BaseNode | FigmaNodeProxy>,
    parent?: (BaseNode & ChildrenMixin) | FigmaNodeProxy,
    index?: number
  ): FigmaVectorNode {
    const parentId = nodeIdOf(parent ?? this.currentPage)
    const id = flattenOf(this.graph, this._renderer, nodes, parentId, index)
    return this.wrapNode(id) as FigmaVectorNode
  }

  flattenNode(nodeIds: string[]): FigmaVectorNode {
    const first = this.graph.getNode(nodeIds[0])
    const parent = this.wrapNode(first?.parentId ?? this._currentPageId)
    return this.flatten(this._nodesById(nodeIds), parent)
  }

  // --- Viewport ---

  private _viewport: ViewportState = { x: 0, y: 0, zoom: 1 }

  get viewport(): FigmaViewport {
    return figmaViewport(this._viewport, (next) => {
      this._viewport = next
    })
  }

  set viewport(v: { center: Vector; zoom: number }) {
    this._viewport = { x: v.center.x, y: v.center.y, zoom: v.zoom }
  }

  createImage(data: Uint8Array): { hash: string } {
    const hash = computeImageHash(data)
    this.graph.images.set(hash, data)
    return { hash }
  }

  // --- Stubs ---

  /** Kalka's brushes are built in, so they are always loaded. */
  loadBrushesAsync(_brushType: 'STRETCH' | 'SCATTER'): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Loads the font so text measures and draws with it from then on. Hosts with their own font
   * sources replace this; a font that cannot load is skipped, where Figma would reject.
   */
  async loadFontAsync(fontName: FigmaFontName): Promise<void> {
    await loadDocumentFont(this.graph, fontName.family, fontName.style).catch(() => null)
  }

  async listAvailableFontsAsync(): Promise<FigmaFont[]> {
    // Default: pure browser / test contexts have no enumeration surface.
    // Desktop hosts override this to return system + bundled fonts.
    return []
  }

  getFontStatus(): DocumentFontStatus {
    return documentFontStatus(this.graph, this.currentPageId)
  }

  base64Encode(data: Uint8Array): string {
    return fromUint8Array(data)
  }

  base64Decode(data: string): Uint8Array {
    if (!isValid(data)) throw new TypeError('Invalid Base64 string')
    return toUint8Array(data)
  }

  notify(message: string): { cancel: () => void } {
    if (typeof console !== 'undefined') console.warn(`[figma.notify] ${message}`)
    return { cancel: noop }
  }

  commitUndo(): void {
    return undefined
  }

  triggerUndo(): void {
    return undefined
  }

  exportImage?: (nodeIds: string[], options: ExportImageOptions) => Promise<Uint8Array | null>
  /** Where icon tools search and fetch icons; hosts may pass a self-hosted or bundled set. */
  icons: IconProvider = iconify
  rasterCodec?: RasterCodec
  /** The document as it was before the current AI run first edited `pageId`, or null if unedited. */
  changeBaseline?: (pageId: string) => SceneGraph | null
  /**
   * Lets go of layers the calling agent marked as being built, those named or all of them with
   * null, and returns those it let go of. Absent in hosts that show no such marks.
   */
  finishWorking?: (nodeIds: string[] | null) => string[]
  /**
   * Shows what the calling agent is doing now next to its name on the canvas, or clears it with
   * an empty text. Absent in hosts that show no agents.
   */
  setAgentStatus?: (text: string) => void
  /**
   * Shows the sections the calling agent is about to build as empty outlines on the canvas, in
   * order, or clears them with an empty list. Absent in hosts that show no agents.
   */
  setAgentPlan?: (sections: PlannedSection[]) => void
  /**
   * Shows the calling agent's questions to the person, one at a time with suggested answers, and
   * resolves with what they answered, or null when they skipped. Absent in hosts with no person
   * to ask.
   */
  askUser?: (questions: AgentQuestion[]) => Promise<AgentAnswer[] | null>
  /** The name the calling agent's comment replies carry, when the host knows it. */
  commentAuthorName?: string
}
