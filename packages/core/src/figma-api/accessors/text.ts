import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import {
  nodeId,
  raw,
  updateNode,
  type NodeProxyInternals,
  type ProxyThis
} from '#core/figma-api/accessor-utils'
import type { FigmaFontName } from '#core/figma-api/fonts'
import { getFontName, setFontName } from '#core/figma-api/text'

function graph(target: ProxyThis, internals: NodeProxyInternals): SceneGraph {
  return target[internals.graph] as SceneGraph
}

/** Getter/setter pair for a text property stored verbatim on the node. */
function field<Field extends keyof SceneNode>(internals: NodeProxyInternals, name: Field) {
  return {
    get(this: ProxyThis): SceneNode[Field] {
      return raw(this, internals)[name]
    },
    set(this: ProxyThis, value: SceneNode[Field]) {
      updateNode(this, internals, { [name]: value } as Partial<SceneNode>)
    }
  }
}

/** Figma's `{ unit, value }` text metrics: pixels, or a percentage of the font size. */
interface FigmaTextMetric {
  unit: 'PIXELS' | 'PERCENT' | 'AUTO'
  value?: number
}

function isTextMetric(value: unknown): value is FigmaTextMetric {
  return !!value && typeof value === 'object' && typeof Reflect.get(value, 'unit') === 'string'
}

/**
 * A text metric in pixels, as Kalka stores it. Figma's `{ unit, value }` form is accepted next to
 * a bare number; a percentage is of the current font size and `AUTO` is null, the font's own.
 */
function metricPixels(
  target: ProxyThis,
  internals: NodeProxyInternals,
  value: unknown,
  name: 'lineHeight' | 'letterSpacing'
): number | null {
  if (typeof value === 'number' || (value === null && name === 'lineHeight')) return value
  if (isTextMetric(value)) {
    if (value.unit === 'AUTO' && name === 'lineHeight') return null
    if (typeof value.value === 'number' && value.unit === 'PIXELS') return value.value
    if (typeof value.value === 'number' && value.unit === 'PERCENT') {
      return (value.value / 100) * raw(target, internals).fontSize
    }
  }
  throw new Error(
    `in set_${name}: Expected { unit, value } or a number, got ${JSON.stringify(value)}`
  )
}

function metric(internals: NodeProxyInternals, name: 'lineHeight' | 'letterSpacing') {
  return {
    get(this: ProxyThis): number | null {
      return raw(this, internals)[name]
    },
    set(this: ProxyThis, value: unknown) {
      const pixels = metricPixels(this, internals, value, name)
      updateNode(this, internals, { [name]: name === 'letterSpacing' ? (pixels ?? 0) : pixels })
    }
  }
}

export function installTextNodeProxyAccessors(
  prototype: object,
  internals: NodeProxyInternals
): void {
  Object.defineProperties(prototype, {
    characters: {
      get(this: ProxyThis): string {
        return raw(this, internals).text
      },
      set(this: ProxyThis, value: string) {
        updateNode(this, internals, { text: value })
      }
    },
    fontName: {
      get(this: ProxyThis): FigmaFontName {
        return getFontName(raw(this, internals))
      },
      set(this: ProxyThis, value: FigmaFontName) {
        setFontName(graph(this, internals), nodeId(this, internals), value)
      }
    },
    fontSize: field(internals, 'fontSize'),
    textStyleId: {
      get(this: ProxyThis): string {
        return raw(this, internals).textStyleId ?? ''
      },
      set(this: ProxyThis, value: string) {
        updateNode(this, internals, { textStyleId: value || null })
      }
    },
    fontWeight: field(internals, 'fontWeight'),
    textAlignHorizontal: field(internals, 'textAlignHorizontal'),
    textAlignVertical: field(internals, 'textAlignVertical'),
    textDirection: field(internals, 'textDirection'),
    textAutoResize: field(internals, 'textAutoResize'),
    letterSpacing: metric(internals, 'letterSpacing'),
    lineHeight: metric(internals, 'lineHeight'),
    textCase: field(internals, 'textCase'),
    textDecoration: field(internals, 'textDecoration'),
    maxLines: field(internals, 'maxLines'),
    textTruncation: field(internals, 'textTruncation'),
    autoRename: field(internals, 'autoRename')
  })
}
