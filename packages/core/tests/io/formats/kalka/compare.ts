import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'

import { UNSAVED_LAYER_FIELDS } from '#core/io/formats/kalka'
import { sameAsWritten } from '#core/io/formats/kalka/values'

/** Six decimals, as tokens are written. */
function sameTokenNumber(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number')
    return Number(a.toFixed(6)) === Number(b.toFixed(6))
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    return [...keys].every((key) => {
      const left: unknown = Reflect.get(a, key)
      const right: unknown = Reflect.get(b, key)
      return sameTokenNumber(left, right)
    })
  }
  return a === b
}

function ignored(node: SceneNode, key: string): boolean {
  if (key === 'derivedTextGlyphs') return node.textPathData === null
  return UNSAVED_LAYER_FIELDS.has(key)
}

/**
 * Where two graphs differ, as `id.field` entries, ignoring only what the format documents it
 * does not keep: `.fig` bookkeeping, shaped text outlines, colors past 8 bits a channel when
 * CSS holds them, and token values past six decimals.
 */
export function graphDifferences(a: SceneGraph, b: SceneGraph): string[] {
  const differences: string[] = []
  if (a.rootId !== b.rootId) differences.push('rootId')
  for (const node of a.getAllNodes()) {
    const other = b.getNode(node.id)
    if (!other) {
      differences.push(`${node.id} missing`)
      continue
    }
    for (const key of Object.keys(node) as Array<keyof SceneNode>) {
      if (ignored(node, key)) continue
      if (!sameAsWritten(node[key], other[key])) differences.push(`${node.id}.${key}`)
    }
  }
  if (a.nodes.size !== b.nodes.size) differences.push(`nodes ${a.nodes.size} ≠ ${b.nodes.size}`)
  for (const [id, variable] of a.variables) {
    const other = b.variables.get(id)
    if (!other) differences.push(`variable ${id} missing`)
    else
      for (const key of Object.keys(variable) as Array<keyof typeof variable>) {
        const same =
          key === 'valuesByMode' || key === 'expressions'
            ? sameTokenNumber(variable[key], other[key])
            : sameAsWritten(variable[key], other[key])
        if (!same) differences.push(`variable ${id}.${key}`)
      }
  }
  if (a.variables.size !== b.variables.size) differences.push('variable count')
  if (!sameAsWritten([...a.variableCollections], [...b.variableCollections]))
    differences.push('collections')
  if (!sameAsWritten(a.activeMode, b.activeMode)) differences.push('activeMode')
  if (!sameAsWritten(a.images, b.images)) differences.push('images')
  if (a.documentColorSpace !== b.documentColorSpace) differences.push('documentColorSpace')
  return differences
}
