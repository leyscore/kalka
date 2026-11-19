import { cloneRecord } from '#fig/node-change/clone'
import { mergeVariableConsumptionMaps } from '#fig/node-change/variable/bindings'
import { mergeVariableModeMaps } from '#fig/node-change/variable/maps'

import type { GUID, NodeChange } from '@kalka/kiwi/fig/codec'

import { declareVariableBindingUnits } from '../bindings/variables'
import { applyDerivedEntry } from '../derived-symbol-data'
import type { PropertyLayer } from '../layers'
import { resolvesInSourceComponent, type SourceIndex } from '../source-index'
import { yieldToInheritedTextStyle } from '../style/inherited-text'
import { invalidateInheritedTextData } from '../text-provenance'
import type { DerivedSymbolOverride } from '../types'
import { findSegment, isRootGuid, pathError, resolveOccurrencePath, SegmentError } from './path'
import type { InstanceOccurrence, InterpretInstanceOptions } from './types'

/** What applying an owner's property claims reads, one per interpretation. */
export interface ClaimContext {
  readonly index: SourceIndex
  readonly options: InterpretInstanceOptions
  /** Fields set by an owner's assignment, by the rank of that owner. */
  readonly assignedFields: WeakMap<InstanceOccurrence, Map<string, number>>
  /** Components an occurrence expanded before an outer decision replaced them. */
  readonly replacedComponents: WeakMap<InstanceOccurrence, readonly GUID[]>
}

export function createClaimContext(
  index: SourceIndex,
  options: InterpretInstanceOptions
): ClaimContext {
  return { index, options, assignedFields: new WeakMap(), replacedComponents: new WeakMap() }
}

function applyPropertyClaim(
  { index, assignedFields }: ClaimContext,
  owner: InstanceOccurrence,
  ownerRank: number,
  target: InstanceOccurrence,
  layer: PropertyLayer
): void {
  // An outer owner's assignment supersedes this owner's explicit value for the same field.
  const bound = assignedFields.get(target)
  const retained = Object.fromEntries(
    Object.entries(layer.props).filter(([field]) => {
      const rank = bound?.get(field)
      return rank === undefined || rank >= ownerRank
    })
  )
  if (index.textStyle) yieldToInheritedTextStyle(target, retained, index.textStyle)
  if (Object.keys(retained).length === 0) return
  declareVariableBindingUnits(target, retained as NodeChange)
  invalidateInheritedTextData(target.properties, retained)
  Object.assign(
    target.properties,
    cloneRecord(retained),
    mergeVariableConsumptionMaps(target.properties, retained as NodeChange),
    // A claimed mode map sets or clears the collections it names; the layer keeps the others.
    mergeVariableModeMaps(target.properties, retained as NodeChange)
  )
  if ('name' in retained) target.hasOwnName = true
  owner.propertyClaims.push({
    declaredBy: owner.sourceId,
    path: structuredClone(layer.path),
    properties: structuredClone(retained)
  })
}

/**
 * A claim that addressed a component an instance on its path no longer expands is
 * stale, not wrong: some outer decision replaced that subtree after it was written.
 */
function isRemovedTarget(
  { index, replacedComponents }: ClaimContext,
  owner: InstanceOccurrence,
  path: readonly GUID[]
): boolean {
  let current = owner
  for (const [position, segment] of path.entries()) {
    const rest = path.slice(position)
    const replaced = replacedComponents.get(current) ?? []
    if (replaced.some((component) => resolvesInSourceComponent(index, component, rest))) return true
    if (position === 0 && isRootGuid(current, segment)) continue
    try {
      current = findSegment(current, segment)
    } catch (error) {
      if (!(error instanceof SegmentError)) throw error
      return false
    }
  }
  return false
}

/** Resolve an owner's declared path in its built subtree, or decide how to skip it. */
function resolveClaimTarget(
  context: ClaimContext,
  owner: InstanceOccurrence,
  path: readonly GUID[]
): InstanceOccurrence | undefined {
  try {
    return resolveOccurrencePath(owner, path)
  } catch (cause) {
    if (!(cause instanceof SegmentError)) throw cause
    const error = pathError(owner.sourceId, owner.mainComponentId, path, cause)
    if (error.diagnostic.reason === 'missing-target' && isRemovedTarget(context, owner, path))
      return undefined
    if (!context.options.onUnresolvedProperty) throw error
    context.options.onUnresolvedProperty(error.diagnostic)
    return undefined
  }
}

/** Apply an owner's property layers to the subtree it built, outer assignments winning. */
export function applyPropertyClaims(
  context: ClaimContext,
  owner: InstanceOccurrence,
  ownerRank: number,
  claims: readonly PropertyLayer[]
): void {
  for (const claim of claims) {
    const target = resolveClaimTarget(context, owner, claim.path)
    if (target) applyPropertyClaim(context, owner, ownerRank, target, claim)
  }
}

/** Apply the saved bounds an owner derived for its descendants. */
export function applyDerivedBounds(
  context: ClaimContext,
  owner: InstanceOccurrence,
  source: NodeChange
): void {
  if (!context.options.derivedBounds) return
  const derived = source.derivedSymbolData as DerivedSymbolOverride[] | undefined
  for (const entry of derived ?? []) {
    const path = entry.guidPath?.guids
    if (!path?.length) continue
    const target = resolveClaimTarget(context, owner, path)
    if (!target || target === owner) continue // Placed root bounds belong to its NodeChange.
    applyDerivedEntry(target, entry)
  }
}
