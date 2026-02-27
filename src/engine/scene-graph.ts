export type NodeType =
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

export interface GUID {
  sessionID: number
  localID: number
}

export interface Color {
  r: number
  g: number
  b: number
  a: number
}

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

  // Text-specific
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  lineHeight: number | null
  letterSpacing: number
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
    text: '',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: 400,
    textAlignHorizontal: 'LEFT',
    lineHeight: null,
    letterSpacing: 0,
    ...overrides
  }
}

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

  deleteNode(id: string): void {
    const node = this.nodes.get(id)
    if (!node || id === this.rootId) return

    // Remove from parent
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (parent) {
        parent.childIds = parent.childIds.filter((cid) => cid !== id)
      }
    }

    // Delete children recursively
    for (const childId of Array.from(node.childIds)) {
      this.deleteNode(childId)
    }

    this.nodes.delete(id)
  }

  hitTest(px: number, py: number): SceneNode | null {
    // Reverse order = topmost first
    const allNodes = [...this.nodes.values()].filter((n) => n.id !== this.rootId && n.visible)

    for (let i = allNodes.length - 1; i >= 0; i--) {
      const n = allNodes[i]
      if (px >= n.x && px <= n.x + n.width && py >= n.y && py <= n.y + n.height) {
        return n
      }
    }
    return null
  }
}
