import {
  newStrokeGeometry,
  type Fill,
  type SceneNode,
  type SharedStyleKind,
  type Stroke
} from '@kalka/scene-graph'
import { normalizeColor } from '@kalka/scene-graph/color'
import { copyFills, copyStrokes } from '@kalka/scene-graph/copy'

import {
  graph,
  raw,
  updateNode,
  type NodeProxyInternals,
  type ProxyThis
} from '#core/figma-api/accessor-utils'
import {
  applyEffectBindings,
  applyPaintBindings,
  paintsWithBindings,
  withoutPaintBindings
} from '#core/figma-api/accessors/variables'
import {
  effectBindings,
  parseFigmaEffects,
  toFigmaEffect,
  type FigmaEffect
} from '#core/figma-api/effects'
import { styleLinkChanges } from '#core/figma-api/styles'

type VisualStyleKind = 'fill' | 'stroke' | 'effect' | 'grid'

const STYLE_FIELDS = {
  fill: 'fillStyleId',
  stroke: 'strokeStyleId',
  effect: 'effectStyleId',
  grid: 'gridStyleId'
} as const satisfies Record<VisualStyleKind, keyof SceneNode>

/**
 * A layer's link to a shared style; linking a style in the document gives the layer its values,
 * as in Figma. An assignment inside an instance is an override.
 */
function styleReference(internals: NodeProxyInternals, kind: VisualStyleKind): PropertyDescriptor {
  return {
    get(this: ProxyThis): string {
      return raw(this, internals)[STYLE_FIELDS[kind]] ?? ''
    },
    set(this: ProxyThis, value: string) {
      linkStyle(this, internals, kind, value)
    }
  }
}

function linkStyle(
  target: ProxyThis,
  internals: NodeProxyInternals,
  kind: SharedStyleKind,
  styleId: string
): void {
  const node = raw(target, internals)
  updateNode(target, internals, styleLinkChanges(graph(target, internals), node, kind, styleId))
}

/** Figma's `setFillStyleIdAsync` and its siblings, which dynamic-page plugins must use. */
function asyncStyleSetter(internals: NodeProxyInternals, kind: SharedStyleKind) {
  return {
    value: async function (this: ProxyThis, styleId: string): Promise<void> {
      linkStyle(this, internals, kind, styleId)
    }
  }
}

/** Figma treats a paint's `opacity` and `visible` as optional, defaulting to 1 and `true`. */
function paintDefaults(paint: Partial<Pick<Fill, 'opacity' | 'visible'>>) {
  return { opacity: paint.opacity ?? 1, visible: paint.visible ?? true }
}

export function installVisualNodeProxyAccessors(
  prototype: object,
  internals: NodeProxyInternals,
  mixed: symbol
): void {
  Object.defineProperties(prototype, {
    fills: {
      get(this: ProxyThis): readonly Fill[] {
        const node = raw(this, internals)
        return Object.freeze(
          paintsWithBindings(copyFills(node.fills), node.boundVariables, 'fills')
        )
      },
      set(this: ProxyThis, value: readonly Fill[]) {
        updateNode(this, internals, {
          fills: withoutPaintBindings(value).map((fill) => ({
            ...fill,
            ...paintDefaults(fill),
            color: normalizeColor(fill.color),
            gradientStops: fill.gradientStops?.map((stop) => ({
              ...stop,
              color: normalizeColor(stop.color)
            }))
          }))
        })
        applyPaintBindings(this, internals, 'fills', value)
      }
    },
    strokes: {
      get(this: ProxyThis): readonly Stroke[] {
        const node = raw(this, internals)
        return Object.freeze(
          paintsWithBindings(copyStrokes(node.strokes), node.boundVariables, 'strokes')
        )
      },
      // Figma paints carry no geometry; a stroke takes the node's weight and alignment, which
      // outlast its strokes.
      set(
        this: ProxyThis,
        value: readonly (Omit<Stroke, 'weight' | 'align'> &
          Partial<Pick<Stroke, 'weight' | 'align'>>)[]
      ) {
        const geometry = newStrokeGeometry(raw(this, internals))
        // The script keeps its paint objects; the node gets its own copies of every nested value.
        const strokes = copyStrokes(
          withoutPaintBindings(value).map((stroke) => ({
            ...stroke,
            ...paintDefaults(stroke),
            weight: stroke.weight ?? geometry.weight,
            align: stroke.align ?? geometry.align,
            color: normalizeColor(stroke.color)
          }))
        )
        const kept = newStrokeGeometry({
          strokes,
          strokeWeight: geometry.weight,
          strokeAlign: geometry.align
        })
        updateNode(this, internals, {
          strokes,
          strokeWeight: kept.weight,
          strokeAlign: kept.align
        })
        applyPaintBindings(this, internals, 'strokes', value)
      }
    },
    effects: {
      get(this: ProxyThis): readonly FigmaEffect[] {
        const node = raw(this, internals)
        return Object.freeze(
          node.effects.map((effect, index) =>
            toFigmaEffect(effect, effectBindings(node.boundVariables, index))
          )
        )
      },
      set(this: ProxyThis, value: readonly FigmaEffect[]) {
        updateNode(this, internals, { effects: parseFigmaEffects(value) })
        applyEffectBindings(this, internals, value)
      }
    },
    // Applied shared styles, as Figma exposes them.
    fillStyleId: styleReference(internals, 'fill'),
    strokeStyleId: styleReference(internals, 'stroke'),
    effectStyleId: styleReference(internals, 'effect'),
    gridStyleId: styleReference(internals, 'grid'),
    setFillStyleIdAsync: asyncStyleSetter(internals, 'fill'),
    setStrokeStyleIdAsync: asyncStyleSetter(internals, 'stroke'),
    setEffectStyleIdAsync: asyncStyleSetter(internals, 'effect'),
    setGridStyleIdAsync: asyncStyleSetter(internals, 'grid'),
    opacity: {
      get(this: ProxyThis): number {
        return raw(this, internals).opacity
      },
      set(this: ProxyThis, value: number) {
        updateNode(this, internals, { opacity: value })
      }
    },
    visible: {
      get(this: ProxyThis): boolean {
        return raw(this, internals).visible
      },
      set(this: ProxyThis, value: boolean) {
        updateNode(this, internals, { visible: value })
      }
    },
    locked: {
      get(this: ProxyThis): boolean {
        return raw(this, internals).locked
      },
      set(this: ProxyThis, value: boolean) {
        updateNode(this, internals, { locked: value })
      }
    },
    blendMode: {
      get(this: ProxyThis): string {
        return raw(this, internals).blendMode
      },
      set(this: ProxyThis, value: string) {
        updateNode(this, internals, { blendMode: value as SceneNode['blendMode'] })
      }
    },
    clipsContent: {
      get(this: ProxyThis): boolean {
        return raw(this, internals).clipsContent
      },
      set(this: ProxyThis, value: boolean) {
        updateNode(this, internals, { clipsContent: value })
      }
    },
    cornerRadius: {
      get(this: ProxyThis): number | symbol {
        const node = raw(this, internals)
        if (node.independentCorners) return mixed
        return node.cornerRadius
      },
      set(this: ProxyThis, value: number | symbol) {
        if (value === mixed) return
        updateNode(this, internals, {
          cornerRadius: value as number,
          topLeftRadius: value as number,
          topRightRadius: value as number,
          bottomRightRadius: value as number,
          bottomLeftRadius: value as number,
          independentCorners: false
        })
      }
    },
    topLeftRadius: cornerAccessor(internals, 'topLeftRadius'),
    topRightRadius: cornerAccessor(internals, 'topRightRadius'),
    bottomLeftRadius: cornerAccessor(internals, 'bottomLeftRadius'),
    bottomRightRadius: cornerAccessor(internals, 'bottomRightRadius'),
    cornerSmoothing: {
      get(this: ProxyThis): number {
        return raw(this, internals).cornerSmoothing
      },
      set(this: ProxyThis, value: number) {
        updateNode(this, internals, { cornerSmoothing: value })
      }
    }
  })
}

function cornerAccessor(
  internals: NodeProxyInternals,
  field: 'topLeftRadius' | 'topRightRadius' | 'bottomLeftRadius' | 'bottomRightRadius'
): PropertyDescriptor {
  return {
    get(this: ProxyThis): number {
      return raw(this, internals)[field]
    },
    set(this: ProxyThis, value: number) {
      updateNode(this, internals, { [field]: value, independentCorners: true })
    }
  }
}
