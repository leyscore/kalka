import { newStrokeGeometry, type SceneGraph, type SceneNode } from '@kalka/scene-graph'

import {
  nodeId,
  raw,
  updateNode,
  type NodeProxyInternals,
  type ProxyThis
} from '#core/figma-api/accessor-utils'
import {
  brushFromFigma,
  drawsAlongPath,
  figmaComplexStroke,
  figmaVariableWidth,
  widthProfileFromFigma
} from '#core/figma-api/complex-strokes'
import {
  setIndependentStrokeWeight,
  setStrokeAlign,
  setStrokeWeight
} from '#core/figma-api/strokes'

type IndependentWeightField =
  | 'borderTopWeight'
  | 'borderRightWeight'
  | 'borderBottomWeight'
  | 'borderLeftWeight'

function graph(target: ProxyThis, internals: NodeProxyInternals): SceneGraph {
  return target[internals.graph] as SceneGraph
}

function independentWeight(internals: NodeProxyInternals, field: IndependentWeightField) {
  return {
    get(this: ProxyThis): number {
      return raw(this, internals)[field]
    },
    set(this: ProxyThis, value: number) {
      setIndependentStrokeWeight(graph(this, internals), nodeId(this, internals), field, value)
    }
  }
}

/** Kalka draws width profiles and brushes along vectors and lines only. */
function assertAlongPath(node: SceneNode, property: string): void {
  if (drawsAlongPath(node)) return
  throw new TypeError(`${property}: Kalka draws this on vectors and lines, not on a ${node.type}`)
}

export function installStrokeNodeProxyAccessors(
  prototype: object,
  internals: NodeProxyInternals
): void {
  Object.defineProperties(prototype, {
    // Figma keeps stroke weight and alignment on the node, with or without strokes.
    strokeWeight: {
      get(this: ProxyThis): number {
        return newStrokeGeometry(raw(this, internals)).weight
      },
      set(this: ProxyThis, value: number) {
        setStrokeWeight(graph(this, internals), raw(this, internals), value)
      }
    },
    strokeAlign: {
      get(this: ProxyThis): string {
        return newStrokeGeometry(raw(this, internals)).align
      },
      set(this: ProxyThis, value: SceneNode['strokeAlign']) {
        setStrokeAlign(graph(this, internals), raw(this, internals), value)
      }
    },
    dashPattern: {
      get(this: ProxyThis): readonly number[] {
        return Object.freeze([...raw(this, internals).dashPattern])
      },
      set(this: ProxyThis, value: readonly number[]) {
        updateNode(this, internals, { dashPattern: [...value] })
      }
    },
    strokeCap: {
      get(this: ProxyThis): string {
        return raw(this, internals).strokeCap
      },
      set(this: ProxyThis, value: string) {
        const strokeCap = value as SceneNode['strokeCap']
        const node = raw(this, internals)
        updateNode(this, internals, {
          strokeCap,
          strokes: node.strokes.map((stroke) => ({ ...stroke, cap: strokeCap }))
        })
      }
    },
    strokeJoin: {
      get(this: ProxyThis): string {
        return raw(this, internals).strokeJoin
      },
      set(this: ProxyThis, value: string) {
        const strokeJoin = value as SceneNode['strokeJoin']
        const node = raw(this, internals)
        updateNode(this, internals, {
          strokeJoin,
          strokes: node.strokes.map((stroke) => ({ ...stroke, join: strokeJoin }))
        })
      }
    },
    strokeMiterLimit: {
      get(this: ProxyThis): number {
        return raw(this, internals).strokeMiterLimit
      },
      set(this: ProxyThis, value: number) {
        updateNode(this, internals, { strokeMiterLimit: value })
      }
    },
    variableWidthStrokeProperties: {
      get(this: ProxyThis) {
        return figmaVariableWidth(raw(this, internals))
      },
      set(this: ProxyThis, value: unknown) {
        const strokeWidthProfile = widthProfileFromFigma(value)
        assertAlongPath(raw(this, internals), 'variableWidthStrokeProperties')
        updateNode(this, internals, { strokeWidthProfile })
      }
    },
    complexStrokeProperties: {
      get(this: ProxyThis) {
        return figmaComplexStroke(raw(this, internals))
      },
      set(this: ProxyThis, value: unknown) {
        const node = raw(this, internals)
        const strokeBrush = brushFromFigma(value, node.strokeBrush)
        if (strokeBrush) assertAlongPath(node, 'complexStrokeProperties')
        updateNode(this, internals, { strokeBrush })
      }
    },
    strokeTopWeight: independentWeight(internals, 'borderTopWeight'),
    strokeBottomWeight: independentWeight(internals, 'borderBottomWeight'),
    strokeLeftWeight: independentWeight(internals, 'borderLeftWeight'),
    strokeRightWeight: independentWeight(internals, 'borderRightWeight')
  })
}
