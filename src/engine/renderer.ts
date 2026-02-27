import type { CanvasKit, Surface, Canvas, Paint } from 'canvaskit-wasm'
import type { SceneNode, SceneGraph, Fill } from './scene-graph'

export class SkiaRenderer {
  private ck: CanvasKit
  private surface: Surface
  private fillPaint: Paint
  private strokePaint: Paint
  private selectionPaint: Paint

  // Viewport
  panX = 0
  panY = 0
  zoom = 1

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
    this.selectionPaint.setStrokeWidth(2)
    this.selectionPaint.setColor(ck.Color4f(0.23, 0.51, 0.96, 1.0))
    this.selectionPaint.setAntiAlias(true)
  }

  render(graph: SceneGraph, selectedIds: Set<string>): void {
    const canvas = this.surface.getCanvas()
    canvas.clear(this.ck.Color4f(0.96, 0.96, 0.96, 1.0))

    canvas.save()
    canvas.translate(this.panX, this.panY)
    canvas.scale(this.zoom, this.zoom)

    // Render all visible nodes
    const root = graph.getNode(graph.rootId)
    if (root) {
      for (const childId of root.childIds) {
        this.renderNode(canvas, graph, childId)
      }
    }

    // Selection outlines (drawn on top)
    for (const id of selectedIds) {
      const node = graph.getNode(id)
      if (!node) continue
      const rect = this.ck.LTRBRect(
        node.x - 0.5,
        node.y - 0.5,
        node.x + node.width + 0.5,
        node.y + node.height + 0.5
      )
      canvas.drawRect(rect, this.selectionPaint)

      // Resize handles
      this.drawHandle(canvas, node.x, node.y)
      this.drawHandle(canvas, node.x + node.width, node.y)
      this.drawHandle(canvas, node.x, node.y + node.height)
      this.drawHandle(canvas, node.x + node.width, node.y + node.height)
      this.drawHandle(canvas, node.x + node.width / 2, node.y)
      this.drawHandle(canvas, node.x + node.width / 2, node.y + node.height)
      this.drawHandle(canvas, node.x, node.y + node.height / 2)
      this.drawHandle(canvas, node.x + node.width, node.y + node.height / 2)
    }

    canvas.restore()
    this.surface.flush()
  }

  private drawHandle(canvas: Canvas, x: number, y: number): void {
    const HANDLE_SIZE = 4
    const handleFill = new this.ck.Paint()
    handleFill.setStyle(this.ck.PaintStyle.Fill)
    handleFill.setColor(this.ck.WHITE)

    const rect = this.ck.LTRBRect(
      x - HANDLE_SIZE,
      y - HANDLE_SIZE,
      x + HANDLE_SIZE,
      y + HANDLE_SIZE
    )
    canvas.drawRect(rect, handleFill)
    canvas.drawRect(rect, this.selectionPaint)
    handleFill.delete()
  }

  private renderNode(canvas: Canvas, graph: SceneGraph, nodeId: string): void {
    const node = graph.getNode(nodeId)
    if (!node || !node.visible) return

    canvas.save()

    if (node.opacity < 1) {
      const layerPaint = new this.ck.Paint()
      layerPaint.setAlphaf(node.opacity)
      canvas.saveLayer(layerPaint)
      layerPaint.delete()
    }

    if (node.rotation !== 0) {
      canvas.rotate(
        node.rotation,
        node.x + node.width / 2,
        node.y + node.height / 2
      )
    }

    this.renderShape(canvas, node)

    // Render children
    for (const childId of node.childIds) {
      this.renderNode(canvas, graph, childId)
    }

    if (node.opacity < 1) {
      canvas.restore()
    }
    canvas.restore()
  }

  private renderShape(canvas: Canvas, node: SceneNode): void {
    const rect = this.ck.LTRBRect(
      node.x,
      node.y,
      node.x + node.width,
      node.y + node.height
    )

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
        case 'RECTANGLE':
        case 'FRAME':
        case 'GROUP':
        case 'SECTION':
          if (hasRadius) {
            if (node.independentCorners) {
              const rrect = this.ck.RRectXY(rect, node.cornerRadius, node.cornerRadius)
              // For independent corners, build a proper RRect
              const radii = [
                node.topLeftRadius, node.topLeftRadius,
                node.topRightRadius, node.topRightRadius,
                node.bottomRightRadius, node.bottomRightRadius,
                node.bottomLeftRadius, node.bottomLeftRadius,
              ]
              const rrectIndep = new Float32Array([
                node.x, node.y,
                node.x + node.width, node.y + node.height,
                ...radii,
              ])
              canvas.drawRRect(rrectIndep, this.fillPaint)
              void rrect
            } else {
              const rrect = this.ck.RRectXY(rect, node.cornerRadius, node.cornerRadius)
              canvas.drawRRect(rrect, this.fillPaint)
            }
          } else {
            canvas.drawRect(rect, this.fillPaint)
          }
          break
        case 'LINE':
          canvas.drawLine(
            node.x,
            node.y,
            node.x + node.width,
            node.y + node.height,
            this.fillPaint
          )
          break
        default:
          canvas.drawRect(rect, this.fillPaint)
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

    // Effects (drop shadows — simplified, drawn behind)
    // Full implementation would use saveLayer + blur filters
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
      y: (sy - this.panY) / this.zoom,
    }
  }

  destroy(): void {
    this.fillPaint.delete()
    this.strokePaint.delete()
    this.selectionPaint.delete()
    this.surface.delete()
  }
}
