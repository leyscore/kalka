import { h, render, type VNode } from 'vue'

import { svgMatrix, type OverlayShape, type Paint } from './shapes'

function paintProps(paint: Paint) {
  return {
    fill: paint.fill ?? 'none',
    stroke: paint.stroke,
    'stroke-width': paint.stroke ? (paint.strokeWidth ?? 1) : undefined,
    'stroke-dasharray': paint.dash ? `${paint.dash[0]} ${paint.dash[1]}` : undefined,
    opacity: paint.opacity,
    // Lines keep their screen width whatever the transform, as editor chrome does.
    'vector-effect': paint.stroke ? 'non-scaling-stroke' : undefined
  }
}

function vnode(shape: OverlayShape, key: number): VNode {
  switch (shape.type) {
    case 'group':
      return h(
        'g',
        {
          key,
          transform: shape.matrix ? svgMatrix(shape.matrix) : undefined,
          opacity: shape.opacity
        },
        shape.children.map(vnode)
      )
    case 'rect':
      return h('rect', {
        key,
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rx: shape.rx,
        ...paintProps(shape)
      })
    case 'ellipse':
      return h('ellipse', {
        key,
        cx: shape.cx,
        cy: shape.cy,
        rx: shape.rx,
        ry: shape.ry,
        ...paintProps(shape)
      })
    case 'line':
      return h('line', {
        key,
        x1: shape.x1,
        y1: shape.y1,
        x2: shape.x2,
        y2: shape.y2,
        ...paintProps(shape)
      })
    case 'polygon':
      return h('polygon', { key, points: shape.points.join(' '), ...paintProps(shape) })
    case 'path':
      return h('path', { key, d: shape.d, ...paintProps(shape) })
    default:
      return h(
        'text',
        {
          key,
          x: shape.x,
          y: shape.y,
          fill: shape.fill,
          opacity: shape.opacity,
          'font-size': shape.fontSize,
          'font-weight': shape.fontWeight,
          'font-family': shape.fontFamily ?? 'Inter, system-ui, sans-serif',
          'text-anchor': shape.anchor
        },
        shape.text
      )
  }
}

const SVG_STYLE =
  'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none'

/**
 * Draws the shapes as an `<svg>` inside `host`, patching what changed since the last frame.
 * The renderer creates the `<svg>` itself so its children get the SVG namespace.
 */
export function renderOverlay(host: HTMLElement, shapes: OverlayShape[]): void {
  render(h('svg', { style: SVG_STYLE, 'aria-hidden': 'true' }, shapes.map(vnode)), host)
}

export function clearOverlay(host: HTMLElement): void {
  render(null, host)
}
