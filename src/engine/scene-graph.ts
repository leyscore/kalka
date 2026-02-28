import { SECTION_TITLE_HEIGHT, SECTION_TITLE_GAP } from '../constants'

export type { GUID, Color } from '../types'

export type HandleMirroring = 'NONE' | 'ANGLE' | 'ANGLE_AND_LENGTH'
export type WindingRule = 'NONZERO' | 'EVENODD'

export interface VectorVertex {
  x: number
  y: number
  strokeCap?: string
  strokeJoin?: string
  cornerRadius?: number
  handleMirroring?: HandleMirroring
}

export interface VectorSegment {
  start: number
  end: number
  tangentStart: { x: number; y: number }
  tangentEnd: { x: number; y: number }
}

export interface VectorRegion {
  windingRule: WindingRule
  loops: number[][]
}

export interface VectorNetwork {
  vertices: VectorVertex[]
  segments: VectorSegment[]
  regions: VectorRegion[]
}

export type NodeType =
  | 'CANVAS'
  | 'FRAME'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'TEXT'
  | 'LINE'
  | 'STAR'
  | 'POLYGON'
  | 'VECTOR'
  | 'GROUP'
  | 'SECTION'

import type { Color } from '../types'

export interface Fill {
  type: 'SOLID'
  color: Color
  opacity: number
  visible: boolean
}

export interface Stroke {
  color: Color
  weight: number
  opacity: number
  visible: boolean
  align: 'INSIDE' | 'CENTER' | 'OUTSIDE'
}

export interface Effect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  color: Color
  offset: { x: number; y: number }
  radius: number
  spread: number
  visible: boolean
}

export type LayoutMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL'
export type LayoutSizing = 'FIXED' | 'HUG' | 'FILL'
export type LayoutAlign = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
export type LayoutCounterAlign = 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'BASELINE'
export type LayoutWrap = 'NO_WRAP' | 'WRAP'

export interface SceneNode {
  id: string
  type: NodeType
  name: string
  parentId: string | null
  childIds: string[]

  x: number
  y: number
  width: number
  height: number
  rotation: number

  fills: Fill[]
  strokes: Stroke[]
  effects: Effect[]
  opacity: number

  cornerRadius: number
  topLeftRadius: number
  topRightRadius: number
  bottomRightRadius: number
  bottomLeftRadius: number
  independentCorners: boolean
  cornerSmoothing: number

  visible: boolean
  locked: boolean
  clipsContent: boolean

  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  lineHeight: number | null
  letterSpacing: number

  layoutMode: LayoutMode
  layoutWrap: LayoutWrap
  primaryAxisAlign: LayoutAlign
  counterAxisAlign: LayoutCounterAlign
  primaryAxisSizing: LayoutSizing
  counterAxisSizing: LayoutSizing
  itemSpacing: number
  counterAxisSpacing: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number

  layoutPositioning: 'AUTO' | 'ABSOLUTE'
  layoutGrow: number
  layoutAlignSelf: 'AUTO' | 'STRETCH'

  vectorNetwork: VectorNetwork | null
}

let nextLocalID = 1

function generateId(): string {
  return `0:${nextLocalID++}`
}

function createDefaultNode(type: NodeType, overrides: Partial<SceneNode> = {}): SceneNode {
  return {
    id: generateId(),
    type,
    name: type.charAt(0) + type.slice(1).toLowerCase(),
    parentId: null,
    childIds: [],
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    fills: [],
    strokes: [],
    effects: [],
    opacity: 1,
    cornerRadius: 0,
    topLeftRadius: 0,
    topRightRadius: 0,
    bottomRightRadius: 0,
    bottomLeftRadius: 0,
    independentCorners: false,
    cornerSmoothing: 0,
    visible: true,
    locked: false,
    clipsContent: false,
    text: '',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: 400,
    textAlignHorizontal: 'LEFT',
    lineHeight: null,
    letterSpacing: 0,
    layoutMode: 'NONE',
    layoutWrap: 'NO_WRAP',
    primaryAxisAlign: 'MIN',
    counterAxisAlign: 'MIN',
    primaryAxisSizing: 'FIXED',
    counterAxisSizing: 'FIXED',
    itemSpacing: 0,
    counterAxisSpacing: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    layoutPositioning: 'AUTO',
    layoutGrow: 0,
    layoutAlignSelf: 'AUTO',
    vectorNetwork: null,
    ...overrides
  }
}

const CONTAINER_TYPES = new Set<NodeType>(['CANVAS', 'FRAME', 'GROUP', 'SECTION'])

export class SceneGraph {
  nodes = new Map<string, SceneNode>()
  rootId: string

  constructor() {
    const root = createDefaultNode('FRAME', {
      name: 'Document',
      width: 0,
      height: 0
    })
    this.rootId = root.id
    this.nodes.set(root.id, root)

    this.addPage('Page 1')
  }

  addPage(name: string): SceneNode {
    return this.createNode('CANVAS', this.rootId, { name, width: 0, height: 0 })
  }

  getPages(): SceneNode[] {
    return this.getChildren(this.rootId).filter((n) => n.type === 'CANVAS')
  }

  getNode(id: string): SceneNode | undefined {
    return this.nodes.get(id)
  }

  getChildren(id: string): SceneNode[] {
    const node = this.nodes.get(id)
    if (!node) return []
    return node.childIds
      .map((cid) => this.nodes.get(cid))
      .filter((n): n is SceneNode => n !== undefined)
  }

  isContainer(id: string): boolean {
    const node = this.nodes.get(id)
    return node ? CONTAINER_TYPES.has(node.type) : false
  }

  isDescendant(childId: string, ancestorId: string): boolean {
    let current = this.nodes.get(childId)
    while (current) {
      if (current.id === ancestorId) return true
      current = current.parentId ? this.nodes.get(current.parentId) : undefined
    }
    return false
  }

  getAbsolutePosition(id: string): { x: number; y: number } {
    let ax = 0
    let ay = 0
    let current = this.nodes.get(id)
    while (current && current.id !== this.rootId && current.type !== 'CANVAS') {
      ax += current.x
      ay += current.y
      current = current.parentId ? this.nodes.get(current.parentId) : undefined
    }
    return { x: ax, y: ay }
  }

  getAbsoluteBounds(id: string): { x: number; y: number; width: number; height: number } {
    const pos = this.getAbsolutePosition(id)
    const node = this.nodes.get(id)
    return {
      x: pos.x,
      y: pos.y,
      width: node?.width ?? 0,
      height: node?.height ?? 0
    }
  }

  createNode(type: NodeType, parentId: string, overrides: Partial<SceneNode> = {}): SceneNode {
    const node = createDefaultNode(type, overrides)
    node.parentId = parentId
    this.nodes.set(node.id, node)

    const parent = this.nodes.get(parentId)
    if (parent) {
      parent.childIds.push(node.id)
    }

    return node
  }

  updateNode(id: string, changes: Partial<SceneNode>): void {
    const node = this.nodes.get(id)
    if (!node) return
    Object.assign(node, changes)
  }

  reparentNode(nodeId: string, newParentId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node || nodeId === this.rootId) return
    if (this.isDescendant(newParentId, nodeId)) return

    const oldParent = node.parentId ? this.nodes.get(node.parentId) : undefined
    const newParent = this.nodes.get(newParentId)
    if (!newParent) return
    if (node.parentId === newParentId) return

    // Convert absolute position
    const absPos = this.getAbsolutePosition(nodeId)
    const newParentNode = this.nodes.get(newParentId)
    const newParentAbs =
      newParentId === this.rootId || newParentNode?.type === 'CANVAS'
        ? { x: 0, y: 0 }
        : this.getAbsolutePosition(newParentId)

    // Remove from old parent
    if (oldParent) {
      oldParent.childIds = oldParent.childIds.filter((cid) => cid !== nodeId)
    }

    // Add to new parent
    node.parentId = newParentId
    newParent.childIds.push(nodeId)

    // Adjust position so node stays in same visual place
    node.x = absPos.x - newParentAbs.x
    node.y = absPos.y - newParentAbs.y
  }

  reorderChild(nodeId: string, parentId: string, insertIndex: number): void {
    const node = this.nodes.get(nodeId)
    if (!node) return

    const oldParent = node.parentId ? this.nodes.get(node.parentId) : undefined
    const newParent = this.nodes.get(parentId)
    if (!newParent) return

    // Remove from old parent
    if (oldParent) {
      oldParent.childIds = oldParent.childIds.filter((cid) => cid !== nodeId)
    }

    // If same parent, adjust index since we removed the item
    let idx = insertIndex
    if (oldParent === newParent && idx > (oldParent.childIds.indexOf(nodeId) === -1 ? idx : oldParent.childIds.length)) {
      // Already removed above, no adjustment needed
    }

    node.parentId = parentId
    idx = Math.min(idx, newParent.childIds.length)
    newParent.childIds.splice(idx, 0, nodeId)
  }

  deleteNode(id: string): void {
    const node = this.nodes.get(id)
    if (!node || id === this.rootId) return

    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (parent) {
        parent.childIds = parent.childIds.filter((cid) => cid !== id)
      }
    }

    for (const childId of Array.from(node.childIds)) {
      this.deleteNode(childId)
    }

    this.nodes.delete(id)
  }

  hitTest(px: number, py: number, scopeId?: string, zoom = 1): SceneNode | null {
    const scope = scopeId ?? this.rootId
    return this.hitTestChildren(px, py, scope, 0, 0, zoom, false)
  }

  private hitTestChildren(
    px: number,
    py: number,
    parentId: string,
    offsetX: number,
    offsetY: number,
    zoom: number,
    insideSection: boolean
  ): SceneNode | null {
    const parent = this.nodes.get(parentId)
    if (!parent) return null

    // Reverse order = topmost first
    for (let i = parent.childIds.length - 1; i >= 0; i--) {
      const childId = parent.childIds[i]
      const child = this.nodes.get(childId)
      if (!child || !child.visible) continue

      const ax = offsetX + child.x
      const ay = offsetY + child.y

      // Check children first (deeper hit)
      if (CONTAINER_TYPES.has(child.type)) {
        const nested = insideSection || child.type === 'SECTION'
        const deepHit = this.hitTestChildren(px, py, childId, ax, ay, zoom, nested)
        if (deepHit) return deepHit
      }

      // Section title pill extends above (top-level) or inside (nested)
      if (child.type === 'SECTION') {
        const titleH = (SECTION_TITLE_HEIGHT + SECTION_TITLE_GAP) / zoom
        let titleTop: number
        if (insideSection) {
          titleTop = ay + SECTION_TITLE_GAP / zoom
        } else {
          titleTop = ay - titleH
        }
        const titleBottom = insideSection ? titleTop + SECTION_TITLE_HEIGHT / zoom : ay
        if (px >= ax && px <= ax + child.width && py >= titleTop && py <= titleBottom) {
          return child
        }
      }

      if (px >= ax && px <= ax + child.width && py >= ay && py <= ay + child.height) {
        return child
      }
    }
    return null
  }

  hitTestFrame(px: number, py: number, excludeIds: Set<string>, scopeId?: string): SceneNode | null {
    return this.hitTestFrameChildren(px, py, scopeId ?? this.rootId, 0, 0, excludeIds)
  }

  private hitTestFrameChildren(
    px: number,
    py: number,
    parentId: string,
    offsetX: number,
    offsetY: number,
    excludeIds: Set<string>
  ): SceneNode | null {
    const parent = this.nodes.get(parentId)
    if (!parent) return null

    // Deepest matching frame wins
    let best: SceneNode | null = null

    for (const childId of parent.childIds) {
      if (excludeIds.has(childId)) continue
      const child = this.nodes.get(childId)
      if (!child || !child.visible) continue

      const ax = offsetX + child.x
      const ay = offsetY + child.y

      if (!CONTAINER_TYPES.has(child.type)) continue
      if (px < ax || px > ax + child.width || py < ay || py > ay + child.height) continue

      best = child

      const deeper = this.hitTestFrameChildren(px, py, childId, ax, ay, excludeIds)
      if (deeper) best = deeper
    }

    return best
  }

  flattenTree(parentId?: string, depth = 0): Array<{ node: SceneNode; depth: number }> {
    const id = parentId ?? this.rootId
    const parent = this.nodes.get(id)
    if (!parent) return []

    const result: Array<{ node: SceneNode; depth: number }> = []
    for (const childId of parent.childIds) {
      const child = this.nodes.get(childId)
      if (!child) continue
      result.push({ node: child, depth })
      if (child.childIds.length > 0) {
        result.push(...this.flattenTree(childId, depth + 1))
      }
    }
    return result
  }
}
