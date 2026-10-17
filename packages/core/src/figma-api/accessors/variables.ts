import type { SceneGraph } from '@kalka/scene-graph'

import {
  nodeId,
  raw,
  updateNode,
  type NodeProxyInternals,
  type ProxyThis
} from '#core/figma-api/accessor-utils'
import {
  aliasedVariableId,
  variableAlias,
  type FigmaVariableAlias
} from '#core/figma-api/variables'
import { reconcileVariableLayouts } from '#core/layout/variables'

function graph(target: ProxyThis, internals: NodeProxyInternals): SceneGraph {
  return target[internals.graph] as SceneGraph
}

/** Figma's names for the node fields Kalka stores under another name. */
const KALKA_BINDING_FIELDS: Readonly<Record<string, string>> = {
  characters: 'text',
  strokeTopWeight: 'borderTopWeight',
  strokeRightWeight: 'borderRightWeight',
  strokeBottomWeight: 'borderBottomWeight',
  strokeLeftWeight: 'borderLeftWeight'
}

const FIGMA_BINDING_FIELDS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(KALKA_BINDING_FIELDS).map(([figma, kalka]) => [kalka, figma])
)

const PAINT_BINDING = /^(fills|strokes)\/(\d+)\/color$/

type PaintKey = 'fills' | 'strokes'

/** Paints as Figma reads them: a bound paint names its variable in `boundVariables.color`. */
export function paintsWithBindings<Paint extends object>(
  paints: readonly Paint[],
  bindings: Readonly<Record<string, string>>,
  key: PaintKey
): Paint[] {
  return paints.map((paint, index) => {
    const variableId = bindings[`${key}/${index}/color`]
    return variableId ? { ...paint, boundVariables: { color: variableAlias(variableId) } } : paint
  })
}

/** Paints without Figma's `boundVariables`, which Kalka keeps on the layer rather than the paint. */
export function withoutPaintBindings<Paint extends object>(paints: readonly Paint[]): Paint[] {
  return paints.map((paint) => {
    if (!('boundVariables' in paint)) return paint
    const { boundVariables: _bindings, ...rest } = paint
    return rest as Paint
  })
}

/** The color variable a Figma paint is bound to, from its `boundVariables.color`. */
function paintVariableId(paint: object | undefined): string | null {
  if (!paint) return null
  const bindings: unknown = Reflect.get(paint, 'boundVariables')
  if (!bindings || typeof bindings !== 'object') return null
  return aliasedVariableId(Reflect.get(bindings, 'color'))
}

/**
 * Binds the layer's paints to the variables the assigned paints name, as Figma does on assigning
 * paints made with `figma.variables.setBoundVariableForPaint`, and unbinds the rest.
 */
export function applyPaintBindings(
  target: ProxyThis,
  internals: NodeProxyInternals,
  key: PaintKey,
  paints: readonly object[]
): void {
  const scene = graph(target, internals)
  const id = nodeId(target, internals)
  const bound = raw(target, internals).boundVariables
  let changed = false
  for (const field of Object.keys(bound)) {
    const match = field.match(PAINT_BINDING)
    if (match?.[1] !== key) continue
    const paint: object | undefined = paints[Number(match[2])]
    if (paintVariableId(paint) === bound[field]) continue
    scene.unbindVariable(id, field)
    changed = true
  }
  paints.forEach((paint, index) => {
    const variableId = paintVariableId(paint)
    const field = `${key}/${index}/color`
    if (!variableId || raw(target, internals).boundVariables[field] === variableId) return
    scene.bindVariable(id, field, variableId)
    changed = true
  })
  if (changed) reconcileVariableLayouts(scene, { subtrees: [id] })
}

function figmaBoundVariables(
  bindings: Readonly<Record<string, string>>
): Record<string, FigmaVariableAlias | FigmaVariableAlias[]> {
  const result: Record<string, FigmaVariableAlias | FigmaVariableAlias[]> = {}
  const paints: Record<PaintKey, [number, FigmaVariableAlias][]> = { fills: [], strokes: [] }
  for (const [field, variableId] of Object.entries(bindings)) {
    const match = field.match(PAINT_BINDING)
    if (match) paints[match[1] as PaintKey].push([Number(match[2]), variableAlias(variableId)])
    else if (!field.includes('/'))
      result[FIGMA_BINDING_FIELDS[field] ?? field] = variableAlias(variableId)
  }
  for (const key of ['fills', 'strokes'] as const) {
    if (paints[key].length > 0) {
      result[key] = paints[key].sort(([a], [b]) => a - b).map(([, alias]) => alias)
    }
  }
  return result
}

export function installVariableModeNodeProxyAccessors(
  prototype: object,
  internals: NodeProxyInternals
): void {
  Object.defineProperties(prototype, {
    explicitVariableModes: {
      get(this: ProxyThis): Readonly<Record<string, string>> {
        return Object.freeze({ ...raw(this, internals).variableModes })
      }
    },
    resolvedVariableModes: {
      get(this: ProxyThis): Readonly<Record<string, string>> {
        const sceneGraph = graph(this, internals)
        const node = raw(this, internals)
        const modes: Record<string, string> = {}
        for (const collectionId of sceneGraph.variableCollections.keys()) {
          const modeId = sceneGraph.getNodeVariableModeId(node.id, collectionId)
          if (modeId) modes[collectionId] = modeId
        }
        return Object.freeze(modes)
      }
    },
    boundVariables: {
      get(this: ProxyThis) {
        return Object.freeze(figmaBoundVariables(raw(this, internals).boundVariables))
      }
    },
    setBoundVariable: {
      value(this: ProxyThis, field: string, variable: { readonly id: string } | null): void {
        const scene = graph(this, internals)
        const id = nodeId(this, internals)
        const kalkaField = KALKA_BINDING_FIELDS[field] ?? field
        try {
          if (variable) scene.bindVariable(id, kalkaField, variable.id)
          else scene.unbindVariable(id, kalkaField)
        } catch (error) {
          throw new Error(
            `in setBoundVariable: ${error instanceof Error ? error.message : String(error)}`
          )
        }
        reconcileVariableLayouts(scene, { subtrees: [id] })
      }
    },
    setExplicitVariableModeForCollection: {
      value(this: ProxyThis, collection: { readonly id: string } | string, modeId: string): void {
        const scene = graph(this, internals)
        const collectionId = typeof collection === 'string' ? collection : collection.id
        const known = scene.variableCollections.get(collectionId)
        if (!known) throw new Error(`Variable collection "${collectionId}" not found`)
        if (!known.modes.some((mode) => mode.modeId === modeId)) {
          throw new Error(`Invalid modeId "${modeId}" for the collection ${known.name}`)
        }
        const variableModes = { ...raw(this, internals).variableModes, [collectionId]: modeId }
        updateNode(this, internals, { variableModes })
        reconcileVariableLayouts(scene, { subtrees: [nodeId(this, internals)] })
      }
    },
    clearExplicitVariableModeForCollection: {
      value(this: ProxyThis, collection: { readonly id: string } | string): void {
        const collectionId = typeof collection === 'string' ? collection : collection.id
        const { [collectionId]: _cleared, ...variableModes } = raw(this, internals).variableModes
        updateNode(this, internals, { variableModes })
        reconcileVariableLayouts(graph(this, internals), { subtrees: [nodeId(this, internals)] })
      }
    }
  })
}
