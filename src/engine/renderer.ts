import type { SceneNode, SceneGraph, Fill } from './scene-graph'
import type { SnapGuide } from './snap'
import type { CanvasKit, Surface, Canvas, Paint, Font } from 'canvaskit-wasm'

export interface RenderOverlays {
  marquee?: { x: number; y: number; width: number; height: number } | null
  snapGuides?: SnapGuide[]
  rotationPreview?: { nodeId: string; angle: number } | null
}

export class SkiaRenderer {
  private ck: CanvasKit
  private surface: Surface
  private fillPaint: Paint
  private strokePaint: Paint
  private selectionPaint: Paint
  private snapPaint: Paint
  private textFont: Font | null = null

  panX = 0
  panY = 0
  zoom = 1
  dpr = 1

  constructor(ck: CanvasKit, surface: Surface) {
    this.ck = ck
    this.surface = surface

    this.fillPaint = new ck.Paint()
    this.fillPaint.setStyle(ck.PaintStyle.Fill)
    this.fillPaint.setAntiAlias(true)

    this.strokePaint = new ck.Paint()
    this.strokePaint.setStyle(ck.PaintStyle.Stroke)
    this.strokePaint.setAntiAlias(true)

    this.selectionPaint = new ck.Paint()
    this.selectionPaint.setStyle(ck.PaintStyle.Stroke)
    this.selectionPaint.setStrokeWidth(1)
    this.selectionPaint.setColor(ck.Color4f(0.23, 0.51, 0.96, 1.0))
    this.selectionPaint.setAntiAlias(true)

    this.snapPaint = new ck.Paint()
    this.snapPaint.setStyle(ck.PaintStyle.Stroke)
    this.snapPaint.setStrokeWidth(1)
    this.snapPaint.setColor(ck.Color4f(1.0, 0.0, 0.56, 1.0))
    this.snapPaint.setAntiAlias(true)

    this.textFont = new ck.Font(null, 14)
  }

  render(graph: SceneGraph, selectedIds: Set<string>, overlays: RenderOverlays = {}): void {
    const canvas = this.surface.getCanvas()
    canvas.clear(this.ck.Color4f(0.96, 0.96, 0.96, 1.0))

    // Scene layer (world coordinates)
    canvas.save()
    canvas.scale(this.dpr, this.dpr)
    canvas.translate(this.panX, this.panY)
    canvas.scale(this.zoom, this.zoom)

    const root = graph.getNode(graph.rootId)
    if (root) {
      for (const childId of root.childIds) {
        this.renderNode(canvas, graph, childId, overlays.rotationPreview)
      }
    }

    canvas.restore()

    // UI overlay layer (screen coordinates, zoom-independent)
    canvas.save()
    canvas.scale(this.dpr, this.dpr)

    this.drawSelection(canvas, graph, selectedIds, overlays.rotationPreview)
    this.drawSnapGuides(canvas, overlays.snapGuides)
    this.drawMarquee(canvas, overlays.marquee)

    canvas.restore()
    this.surface.flush()
  }

  // --- Selection UI ---

  private drawSelection(
    canvas: Canvas,
    graph: SceneGraph,
    selectedIds: Set<string>,
    rotationPreview?: { nodeId: string; angle: number } | null
  ): void {
    if (selectedIds.size === 0) return

    this.selectionPaint.setStrokeWidth(1)

    if (selectedIds.size === 1) {
      const id = [...selectedIds][0]
      const node = graph.getNode(id)
      if (!node) return

      const rotation = rotationPreview?.nodeId === id ? rotationPreview.angle : node.rotation
      this.drawNodeSelection(canvas, node, rotation)
      return
    }

    // Multi-select: individual outlines + unified bounding box
    for (const id of selectedIds) {
      const node = graph.getNode(id)
      if (!node) continue
      const rotation = rotationPreview?.nodeId === id ? rotationPreview.angle : node.rotation
      this.drawNodeOutline(canvas, node, rotation)
    }

    // Unified bounding box
    const nodes = [...selectedIds]
      .map((id) => graph.getNode(id))
      .filter((n): n is SceneNode => n !== undefined)
    this.drawGroupBounds(canvas, nodes)
  }

  private drawNodeSelection(canvas: Canvas, node: SceneNode, rotation: number): void {
    const cx = (node.x + node.width / 2) * this.zoom + this.panX
    const cy = (node.y + node.height / 2) * this.zoom + this.panY
    const hw = (node.width / 2) * this.zoom
    const hh = (node.height / 2) * this.zoom

    canvas.save()
    if (rotation !== 0) {
      canvas.rotate(rotation, cx, cy)
    }

    const x1 = cx - hw
    const y1 = cy - hh
    const x2 = cx + hw
    const y2 = cy + hh

    canvas.drawRect(this.ck.LTRBRect(x1, y1, x2, y2), this.selectionPaint)

    // Corner handles
    this.drawHandle(canvas, x1, y1)
    this.drawHandle(canvas, x2, y1)
    this.drawHandle(canvas, x1, y2)
    this.drawHandle(canvas, x2, y2)

    // Edge handles
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    this.drawHandle(canvas, mx, y1)
    this.drawHandle(canvas, mx, y2)
    this.drawHandle(canvas, x1, my)
    this.drawHandle(canvas, x2, my)

    // Rotation handle (line extending above + circle)
    const rotHandleY = y1 - 24
    const rotLinePaint = new this.ck.Paint()
    rotLinePaint.setStyle(this.ck.PaintStyle.Stroke)
    rotLinePaint.setStrokeWidth(1)
    rotLinePaint.setColor(this.ck.Color4f(0.23, 0.51, 0.96, 1.0))
    rotLinePaint.setAntiAlias(true)
    canvas.drawLine(mx, y1, mx, rotHandleY, rotLinePaint)

    const rotFill = new this.ck.Paint()
    rotFill.setStyle(this.ck.PaintStyle.Fill)
    rotFill.setColor(this.ck.WHITE)
    rotFill.setAntiAlias(true)
    canvas.drawCircle(mx, rotHandleY, 4, rotFill)
    canvas.drawCircle(mx, rotHandleY, 4, rotLinePaint)
    rotLinePaint.delete()
    rotFill.delete()

    canvas.restore()
  }

  private drawNodeOutline(canvas: Canvas, node: SceneNode, rotation: number): void {
    const cx = (node.x + node.width / 2) * this.zoom + this.panX
    const cy = (node.y + node.height / 2) * this.zoom + this.panY
    const hw = (node.width / 2) * this.zoom
    const hh = (node.height / 2) * this.zoom

    canvas.save()
    if (rotation !== 0) {
      canvas.rotate(rotation, cx, cy)
    }

    canvas.drawRect(this.ck.LTRBRect(cx - hw, cy - hh, cx + hw, cy + hh), this.selectionPaint)
    canvas.restore()
  }

  private drawGroupBounds(canvas: Canvas, nodes: SceneNode[]): void {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const n of nodes) {
      // For rotated nodes, use AABB of the rotated corners
      if (n.rotation !== 0) {
        const corners = this.getRotatedCorners(n)
        for (const c of corners) {
          minX = Math.min(minX, c.x)
          minY = Math.min(minY, c.y)
          maxX = Math.max(maxX, c.x)
          maxY = Math.max(maxY, c.y)
        }
      } else {
        const x1 = n.x * this.zoom + this.panX
        const y1 = n.y * this.zoom + this.panY
        const x2 = (n.x + n.width) * this.zoom + this.panX
        const y2 = (n.y + n.height) * this.zoom + this.panY
        minX = Math.min(minX, x1)
        minY = Math.min(minY, y1)
        maxX = Math.max(maxX, x2)
        maxY = Math.max(maxY, y2)
      }
    }

    // Dashed bounding box
    const dashPaint = new this.ck.Paint()
    dashPaint.setStyle(this.ck.PaintStyle.Stroke)
    dashPaint.setStrokeWidth(1)
    dashPaint.setColor(this.ck.Color4f(0.23, 0.51, 0.96, 0.6))
    dashPaint.setAntiAlias(true)

    canvas.drawRect(this.ck.LTRBRect(minX, minY, maxX, maxY), dashPaint)

    // Group resize handles
    this.drawHandle(canvas, minX, minY)
    this.drawHandle(canvas, maxX, minY)
    this.drawHandle(canvas, minX, maxY)
    this.drawHandle(canvas, maxX, maxY)
    const gmx = (minX + maxX) / 2
    const gmy = (minY + maxY) / 2
    this.drawHandle(canvas, gmx, minY)
    this.drawHandle(canvas, gmx, maxY)
    this.drawHandle(canvas, minX, gmy)
    this.drawHandle(canvas, maxX, gmy)

    dashPaint.delete()
  }

  private getRotatedCorners(n: SceneNode) {
    const cx = (n.x + n.width / 2) * this.zoom + this.panX
    const cy = (n.y + n.height / 2) * this.zoom + this.panY
    const hw = (n.width / 2) * this.zoom
    const hh = (n.height / 2) * this.zoom
    const rad = (n.rotation * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    return [
      { x: cx + -hw * cos - -hh * sin, y: cy + -hw * sin + -hh * cos },
      { x: cx + hw * cos - -hh * sin, y: cy + hw * sin + -hh * cos },
      { x: cx + hw * cos - hh * sin, y: cy + hw * sin + hh * cos },
      { x: cx + -hw * cos - hh * sin, y: cy + -hw * sin + hh * cos }
    ]
  }

  private drawHandle(canvas: Canvas, x: number, y: number): void {
    const S = 3
    const handleFill = new this.ck.Paint()
    handleFill.setStyle(this.ck.PaintStyle.Fill)
    handleFill.setColor(this.ck.WHITE)

    const rect = this.ck.LTRBRect(x - S, y - S, x + S, y + S)
    canvas.drawRect(rect, handleFill)
    canvas.drawRect(rect, this.selectionPaint)
    handleFill.delete()
  }

  // --- Snap guides ---

  private drawSnapGuides(canvas: Canvas, guides?: SnapGuide[]): void {
    if (!guides || guides.length === 0) return

    for (const guide of guides) {
      if (guide.axis === 'x') {
        const x = guide.position * this.zoom + this.panX
        const y1 = guide.from * this.zoom + this.panY
        const y2 = guide.to * this.zoom + this.panY
        canvas.drawLine(x, y1, x, y2, this.snapPaint)
      } else {
        const y = guide.position * this.zoom + this.panY
        const x1 = guide.from * this.zoom + this.panX
        const x2 = guide.to * this.zoom + this.panX
        canvas.drawLine(x1, y, x2, y, this.snapPaint)
      }
    }
  }

  // --- Marquee ---

  private drawMarquee(
    canvas: Canvas,
    marquee?: { x: number; y: number; width: number; height: number } | null
  ): void {
    if (!marquee || marquee.width <= 0 || marquee.height <= 0) return

    const x1 = marquee.x * this.zoom + this.panX
    const y1 = marquee.y * this.zoom + this.panY
    const x2 = (marquee.x + marquee.width) * this.zoom + this.panX
    const y2 = (marquee.y + marquee.height) * this.zoom + this.panY
    const rect = this.ck.LTRBRect(x1, y1, x2, y2)

    const fill = new this.ck.Paint()
    fill.setStyle(this.ck.PaintStyle.Fill)
    fill.setColor(this.ck.Color4f(0.23, 0.51, 0.96, 0.08))
    canvas.drawRect(rect, fill)
    canvas.drawRect(rect, this.selectionPaint)
    fill.delete()
  }

  // --- Scene rendering ---

  private renderNode(
    canvas: Canvas,
    graph: SceneGraph,
    nodeId: string,
    rotationPreview?: { nodeId: string; angle: number } | null
  ): void {
    const node = graph.getNode(nodeId)
    if (!node || !node.visible) return

    canvas.save()

    if (node.opacity < 1) {
      const layerPaint = new this.ck.Paint()
      layerPaint.setAlphaf(node.opacity)
      canvas.saveLayer(layerPaint)
      layerPaint.delete()
    }

    const rotation = rotationPreview?.nodeId === nodeId ? rotationPreview.angle : node.rotation

    if (rotation !== 0) {
      canvas.rotate(rotation, node.x + node.width / 2, node.y + node.height / 2)
    }

    // Clip children for frames
    if (node.type === 'FRAME') {
      const clipRect = this.ck.LTRBRect(node.x, node.y, node.x + node.width, node.y + node.height)
      this.renderShape(canvas, node)
      canvas.save()
      canvas.clipRect(clipRect, this.ck.ClipOp.Intersect, true)
      for (const childId of node.childIds) {
        this.renderNode(canvas, graph, childId, rotationPreview)
      }
      canvas.restore()
    } else {
      this.renderShape(canvas, node)
      for (const childId of node.childIds) {
        this.renderNode(canvas, graph, childId, rotationPreview)
      }
    }

    if (node.opacity < 1) {
      canvas.restore()
    }
    canvas.restore()
  }

  private renderShape(canvas: Canvas, node: SceneNode): void {
    const rect = this.ck.LTRBRect(node.x, node.y, node.x + node.width, node.y + node.height)

    const hasRadius =
      node.cornerRadius > 0 ||
      (node.independentCorners &&
        (node.topLeftRadius > 0 ||
          node.topRightRadius > 0 ||
          node.bottomRightRadius > 0 ||
          node.bottomLeftRadius > 0))

    // Fills
    for (const fill of node.fills) {
      if (!fill.visible) continue
      this.applyFill(fill)
      this.fillPaint.setAlphaf(fill.opacity)

      switch (node.type) {
        case 'ELLIPSE':
          canvas.drawOval(rect, this.fillPaint)
          break
        case 'TEXT':
          this.renderText(canvas, node)
          break
        case 'LINE':
          canvas.drawLine(node.x, node.y, node.x + node.width, node.y + node.height, this.fillPaint)
          break
        default:
          if (hasRadius) {
            if (node.independentCorners) {
              const rrect = new Float32Array([
                node.x,
                node.y,
                node.x + node.width,
                node.y + node.height,
                node.topLeftRadius,
                node.topLeftRadius,
                node.topRightRadius,
                node.topRightRadius,
                node.bottomRightRadius,
                node.bottomRightRadius,
                node.bottomLeftRadius,
                node.bottomLeftRadius
              ])
              canvas.drawRRect(rrect, this.fillPaint)
            } else {
              const rrect = this.ck.RRectXY(rect, node.cornerRadius, node.cornerRadius)
              canvas.drawRRect(rrect, this.fillPaint)
            }
          } else {
            canvas.drawRect(rect, this.fillPaint)
          }
      }
    }

    // Strokes
    for (const stroke of node.strokes) {
      if (!stroke.visible) continue
      this.strokePaint.setColor(
        this.ck.Color4f(stroke.color.r, stroke.color.g, stroke.color.b, stroke.color.a)
      )
      this.strokePaint.setStrokeWidth(stroke.weight)
      this.strokePaint.setAlphaf(stroke.opacity)

      switch (node.type) {
        case 'ELLIPSE':
          canvas.drawOval(rect, this.strokePaint)
          break
        default:
          if (hasRadius && !node.independentCorners) {
            const rrect = this.ck.RRectXY(rect, node.cornerRadius, node.cornerRadius)
            canvas.drawRRect(rrect, this.strokePaint)
          } else {
            canvas.drawRect(rect, this.strokePaint)
          }
      }
    }
  }

  private renderText(canvas: Canvas, node: SceneNode): void {
    if (!this.textFont || !('text' in node)) return
    const text = (node as SceneNode & { text?: string }).text ?? ''
    if (!text) return

    canvas.drawText(text, node.x, node.y + 14, this.fillPaint, this.textFont)
  }

  private applyFill(fill: Fill): void {
    if (fill.type === 'SOLID') {
      this.fillPaint.setColor(
        this.ck.Color4f(fill.color.r, fill.color.g, fill.color.b, fill.color.a)
      )
    }
  }

  screenToCanvas(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this.panX) / this.zoom,
      y: (sy - this.panY) / this.zoom
    }
  }

  destroy(): void {
    this.fillPaint.delete()
    this.strokePaint.delete()
    this.selectionPaint.delete()
    this.snapPaint.delete()
    this.textFont?.delete()
    this.surface.delete()
  }
}
