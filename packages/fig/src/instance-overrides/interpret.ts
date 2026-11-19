import { compact } from 'es-toolkit/array'

import type { GUID, NodeChange } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'

import { assetIdsByKey, createTextStyleLookup } from '../node-change/style/lookup'
import {
  bindSourceProperties,
  componentBindings,
  instanceBindings,
  type BoundPropertyClaim,
  type PropertyBinding
} from './bindings/properties'
import { declareSourceVariableBindingUnits } from './bindings/variables'
import {
  ownLayers,
  type AssignmentGroup,
  type Owner,
  type PropertyLayer,
  type StructuralLayer
} from './layers'
import { applyDerivedBounds, applyPropertyClaims, createClaimContext } from './occurrence/claims'
import { createOccurrence, type RootResolution, type Subtree } from './occurrence/create'
import { isRootGuid, pathError, resolveOccurrencePath, SegmentError } from './occurrence/path'
import type { InstanceOccurrence, InterpretInstanceOptions } from './occurrence/types'
import { applyPlacedConstraints } from './resize'
import { applyInstanceLayoutScale } from './scale/layout'
import {
  createSourceIndex,
  findStaticSegment,
  idOf,
  componentKeys,
  recordMatches,
  resolvesInSourceComponent,
  sameGuid,
  terminalComponent,
  type SourceIndex
} from './source-index'
import { assignedSlotContent, type ComponentPropAssignment } from './types'

/**
 * Figma's instance model reduces to three things: an instance expands its component's
 * subtree; owners contribute layers, each a partial record at a path relative to that
 * owner; and the outermost owner wins where layers overlap. A swap and a property
 * assignment are structural layers, everything else is a property layer.
 *
 * Structural layers are routed down to the instance they configure before it expands,
 * so every occurrence expands exactly once with its effective component and complete
 * assignment list. Property layers are applied by their declaring owner onto the built
 * subtree, so their values stay in that owner's coordinate space; outer owners apply
 * after inner ones by construction. Saved derived data is a cache, applied last.
 */

export { resolveOccurrencePath } from './occurrence/path'

export function interpretInstance(
  changes: readonly NodeChange[],
  instanceId: string,
  options: InterpretInstanceOptions = {}
): InstanceOccurrence {
  return createOccurrenceInterpreter(changes).instance(instanceId, options)
}

export function interpretComponent(
  changes: readonly NodeChange[],
  componentId: string,
  options: InterpretInstanceOptions = {}
): InstanceOccurrence {
  return createOccurrenceInterpreter(changes).component(componentId, options)
}

/** One source index per document; evaluation state remains local to each call. */
export function createOccurrenceInterpreter(changes: readonly NodeChange[]) {
  // Removed records are gone, as the document reader drops them.
  const active = changes.filter((change) => change.phase !== 'REMOVED')
  const index = createSourceIndex(active)
  return createIndexedOccurrenceInterpreter({
    ...index,
    textStyle: createTextStyleLookup(index.sources, assetIdsByKey(active))
  })
}

/** An interpreter over an index built elsewhere, such as one that decodes records as read. */
export function createIndexedOccurrenceInterpreter(index: SourceIndex) {
  return {
    instance: (id: string, options: InterpretInstanceOptions = {}) =>
      interpretRoot(index, id, 'INSTANCE', options),
    component: (id: string, options: InterpretInstanceOptions = {}) =>
      interpretRoot(index, id, 'SYMBOL', options),
    page: (id: string, options: InterpretInstanceOptions = {}) =>
      interpretRoot(index, id, 'CANVAS', options)
  }
}

/** The record whose layer or assignment chose a component, and its rank in the read. */
interface Choice {
  id: string
  rank: number
}

/** Unwinds a read to the instance whose choice closed a component loop, which it leaves out. */
class LoopCutError extends Error {
  override name = 'LoopCutError'
  constructor(readonly ownerId: string) {
    super(`Component loop entered by ${ownerId}`)
  }
}

function interpretRoot(
  index: SourceIndex,
  rootId: string,
  expectedType: 'INSTANCE' | 'SYMBOL' | 'CANVAS',
  options: InterpretInstanceOptions
): InstanceOccurrence {
  const { sources, children } = index
  /** The components being expanded, outermost first; one recurs where a swap repeats it. */
  const entries: Array<{ componentId: string; rank: number; chosenAt: number }> = []
  const claimContext = createClaimContext(index, options)

  /** A layer written against a component that an outer decision replaced is stale, not wrong. */
  const isStaleLayer = ({ boundary }: StructuralLayer): boolean =>
    boundary?.replaced.some((component) =>
      resolvesInSourceComponent(index, component, boundary.path)
    ) ?? false

  /**
   * An address that resolves to nothing is a record Figma kept after deleting the node it
   * named, and a swap is no different: its replacement can be present while the layer it
   * replaced is gone. An ambiguous address means the path is wrong, which stays fatal.
   */
  const unresolvedStructural = (layer: StructuralLayer, cause: SegmentError): void => {
    if (cause.count === 0 && isStaleLayer(layer)) return
    const error = pathError(layer.owner.id, layer.owner.mainComponentId, layer.declaredPath, cause)
    if (cause.count !== 0 || !options.onUnresolvedAssignment) throw error
    layer.owner.unresolved.push({
      ...error.diagnostic,
      assignments: structuredClone(layer.assignments)
    })
  }

  /** Dispatch structural layers to the direct child whose static subtree holds their first segment. */
  const routeToChildren = (
    id: string,
    layers: readonly StructuralLayer[]
  ): Map<string, StructuralLayer[]> => {
    const routed = new Map<string, StructuralLayer[]>()
    for (const layer of layers) {
      const [segment] = layer.path
      const { count, topChild } = findStaticSegment(index, id, segment)
      if (!topChild?.guid) {
        unresolvedStructural(layer, new SegmentError(count, segment))
        continue
      }
      const childId = guidToString(topChild.guid)
      const direct = recordMatches(topChild, segment)
      const next = { ...layer, path: direct ? layer.path.slice(1) : layer.path }
      const bucket = routed.get(childId)
      if (bucket) bucket.push(next)
      else routed.set(childId, [next])
    }
    return routed
  }

  /** Components an occurrence would have expanded before outer bindings replaced them. */
  const bindingHistory = (
    raw: NodeChange,
    effective: GUID | undefined,
    superseded: readonly GUID[]
  ): GUID[] => {
    const original = raw.symbolData?.symbolID
    if (!effective) return []
    return [...(original ? [original] : []), ...superseded].filter(
      (component) => !sameGuid(component, effective)
    )
  }

  /**
   * Root layers select the effective component and the complete assignment list, in
   * inner-to-outer order so later entries win. Everything else addresses a descendant.
   */
  const resolveRoot = (
    raw: NodeChange,
    source: NodeChange,
    superseded: readonly GUID[],
    structural: readonly StructuralLayer[],
    rank: number
  ): RootResolution => {
    let effective = source.symbolData?.symbolID
    const replaced = bindingHistory(raw, effective, superseded)
    const keys = [
      ...componentKeys(index, raw.symbolData?.symbolID),
      ...componentKeys(index, effective)
    ]
    const isKey = (guid: GUID): boolean => keys.some((key) => sameGuid(key, guid))
    const groups: AssignmentGroup[] = [
      {
        assignments: (source.componentPropAssignments ?? []) as ComponentPropAssignment[],
        rank,
        ownerId: idOf(raw) ?? ''
      }
    ]
    const descendant: StructuralLayer[] = []
    let swappedBy: { id: string; rank: number } | undefined
    const swapRoot = (swap: GUID, swapOwner: Owner): void => {
      if (!effective) throw new Error('Swap target is not an instance')
      if (!sameGuid(effective, swap)) replaced.push(effective)
      effective = swap
      swappedBy = { id: swapOwner.id, rank: swapOwner.rank }
      // Later layers may address the root through the replacement's identity.
      for (const key of componentKeys(index, effective)) if (!isKey(key)) keys.push(key)
    }
    for (const layer of structural) {
      const addressesRoot = layer.path.length === 0 || isKey(layer.path[0])
      if (!addressesRoot || layer.path.length > 1) {
        descendant.push(addressesRoot ? { ...layer, path: layer.path.slice(1) } : layer)
        continue
      }
      if (layer.swap) swapRoot(layer.swap, layer.owner)
      if (layer.assignments.length)
        groups.push({
          assignments: layer.assignments,
          rank: layer.owner.rank,
          ownerId: layer.owner.id
        })
    }
    return { effective, replaced, swappedBy, groups, descendant }
  }

  /** Bind the record's fields from the enclosing component scope, recording provenance. */
  const bindRecord = (
    raw: NodeChange,
    bindings: readonly PropertyBinding[]
  ): {
    source: NodeChange
    claims: BoundPropertyClaim[]
    /** Fields set by an owner's assignment, by that owner's rank. */
    bound: Map<string, number>
    /** The owner whose assignment chose the component the record expands. */
    symbolOwner: Choice | undefined
    /** Swap values earlier owners assigned before a later one replaced them. */
    superseded: GUID[]
    /** The content frame an assignment put in this slot frame. */
    slotContent: string | undefined
  } => {
    const claims: BoundPropertyClaim[] = []
    const bound = new Map<string, number>()
    const superseded: GUID[] = []
    let slotContent: string | undefined
    let symbolOwner: Choice | undefined
    const source = bindSourceProperties(raw, bindings, (claim, binding) => {
      claims.push(claim)
      if (binding.origin === 'assignment' && binding.rank !== undefined)
        bound.set(claim.field, binding.rank)
      if (claim.field === 'symbolData' && binding.rank !== undefined && binding.ownerId)
        symbolOwner = { id: binding.ownerId, rank: binding.rank }
      if (claim.field === 'symbolData')
        for (const value of binding.superseded ?? [])
          if (value.guidValue) superseded.push(value.guidValue)
      if (claim.field === 'slotContent') {
        const content = assignedSlotContent(binding.value)
        slotContent = content ? guidToString(content) : undefined
      }
    })
    if (slotContent && !sources.has(slotContent)) {
      if (!options.onMissingSlotContent) throw new Error(`Missing slot content ${slotContent}`)
      options.onMissingSlotContent({ slotId: idOf(raw) ?? '', slotContentId: slotContent })
      slotContent = undefined
    }
    return { source, claims, bound, symbolOwner, superseded, slotContent }
  }

  /**
   * A component expanding inside its own expansion is a loop only when every choice since it
   * was entered came from inside that expansion: its definition then holds it at every depth.
   * A swap or swap property value from further out applies at its own path only, so Figma
   * expands the component once more with its defaults, and so does this read.
   */
  const closesLoop = (componentId: string, chosenAt: number): boolean => {
    let entry = entries.length - 1
    while (entry >= 0 && entries[entry].componentId !== componentId) entry--
    if (entry < 0) return false
    const { rank } = entries[entry]
    if (chosenAt < rank) return false
    return entries.slice(entry + 1).every((later) => later.chosenAt >= rank)
  }

  /**
   * Whether the record leaves out the instance it would expand, its component closing a loop.
   * The instance whose choice entered the loop goes, as Figma's repair deletes it from its
   * definition; a choice made further in unwinds the read to that instance.
   */
  const leavesOut = (id: string, effective: GUID | undefined, choice: Choice): boolean => {
    if (!effective || !closesLoop(guidToString(effective), choice.rank)) return false
    if (choice.id !== id) throw new LoopCutError(choice.id)
    options.onCyclicComponent?.({ instanceId: id })
    return true
  }

  /**
   * Expand one source record. `layers` are structural layers addressed relative to this
   * expansion: an empty path configures this record itself, a longer path a descendant.
   * Returns null for an instance left out because its component would contain itself.
   */
  const expand = (
    id: string,
    bindings: readonly PropertyBinding[],
    layers: readonly StructuralLayer[],
    rank: number,
    /** The rank of the owner whose choice made this record an instance's base. */
    chosenAt?: number
  ): InstanceOccurrence | null => {
    const raw = sources.get(id)
    if (!raw) throw new Error(`Missing source node ${id}`)
    const record = bindRecord(raw, bindings)
    const { source } = record
    const entered = raw.type === 'SYMBOL' || chosenAt !== undefined
    if (entered) entries.push({ componentId: id, rank, chosenAt: chosenAt ?? rank })
    try {
      const owner: Owner = { id, rank, mainComponentId: null, unresolved: [] }
      const own = ownLayers(source, owner)
      const structural = [...own.structural, ...layers].sort((a, b) => b.owner.rank - a.owner.rank)
      const root = resolveRoot(raw, source, record.superseded, structural, rank)
      const choice = root.swappedBy ?? record.symbolOwner ?? { id, rank }
      if (leavesOut(id, root.effective, choice)) return null
      const subtree = expandSubtree(id, owner, source, bindings, root, record.slotContent, {
        rank,
        chosenAt: choice.rank
      })
      const occurrence = createOccurrence(index, id, raw, source, root, subtree, record.claims)
      if (record.slotContent) occurrence.slotContentId = record.slotContent
      claimContext.assignedFields.set(occurrence, record.bound)
      if (subtree.base && root.replaced.length)
        claimContext.replacedComponents.set(occurrence, root.replaced)
      declareSourceVariableBindingUnits(occurrence, source)
      const claims = subtree.dangling
        ? own.claims.filter(({ path }) => path.length === 1 && isRootGuid(occurrence, path[0]))
        : own.claims
      finishOccurrence(occurrence, subtree.base, source, claims, rank, !subtree.dangling)
      for (const diagnostic of owner.unresolved)
        options.onUnresolvedAssignment?.({
          ...diagnostic,
          mainComponentId: occurrence.mainComponentId
        })
      return occurrence
    } catch (error) {
      if (!(error instanceof LoopCutError) || error.ownerId !== id) throw error
      options.onCyclicComponent?.({ instanceId: id })
      return null
    } finally {
      if (entered) entries.pop()
    }
  }

  /** What a record expands beneath itself: its component, its slot content, or its children. */
  const expandSubtree = (
    id: string,
    owner: Owner,
    source: NodeChange,
    bindings: readonly PropertyBinding[],
    root: RootResolution,
    slotContent: string | undefined,
    { rank, chosenAt }: { rank: number; chosenAt: number }
  ): Subtree => {
    if (root.effective)
      return expandBase(owner, { ...root, effective: root.effective }, rank, chosenAt)
    if (slotContent) return expandSlotContent(slotContent, root.descendant, rank)
    return expandChildren(id, source, bindings, root.groups, root.descendant, rank)
  }

  /**
   * The component expansion receives the assignments as its own root layers and the
   * descendant layers unchanged: both address the same subtree.
   */
  const expandBase = (
    owner: Owner,
    { effective, replaced, groups, descendant }: RootResolution & { effective: GUID },
    rank: number,
    chosenAt: number
  ): Subtree => {
    const componentId = guidToString(effective)
    if (!sources.has(componentId)) {
      // Layers addressed into the missing subtree have nothing to configure.
      if (!options.onMissingComponent) throw new Error(`Missing source node ${componentId}`)
      options.onMissingComponent({ ownerId: owner.id, componentId })
      return { base: null, children: [], dangling: true }
    }
    owner.mainComponentId = terminalComponent(index, componentId)
    const crossing = descendant.map((layer) =>
      replaced.length ? { ...layer, boundary: { replaced, path: layer.path } } : layer
    )
    const rootLayers = groups
      .filter((group) => group.assignments.length)
      .map((group): StructuralLayer => ({
        owner: { ...owner, id: group.ownerId, rank: group.rank },
        declaredPath: [],
        path: [],
        assignments: group.assignments
      }))
    const base = expand(
      guidToString(effective),
      [],
      [...rootLayers, ...crossing],
      rank + 1,
      chosenAt
    )
    // An instance of itself stands in for a component it can never show: it reads as empty.
    if (!base) return { base: null, children: [], dangling: true }
    return { base, children: base.children }
  }

  /** A component definition starts a binding scope; ordinary containers pass theirs through. */
  const expandChildren = (
    id: string,
    source: NodeChange,
    bindings: readonly PropertyBinding[],
    groups: readonly AssignmentGroup[],
    descendant: readonly StructuralLayer[],
    rank: number
  ): Subtree => {
    const scoped =
      source.type === 'SYMBOL'
        ? groups.reduce(
            (result, group) =>
              instanceBindings(result, group.assignments, group.rank, group.ownerId),
            componentBindings(source)
          )
        : bindings
    const routed = routeToChildren(id, descendant)
    const expanded = (children.get(id) ?? []).map((child) => {
      if (!child.guid) throw new Error('Indexed child has no GUID')
      const childId = guidToString(child.guid)
      return expand(childId, scoped, routed.get(childId) ?? [], rank + 1)
    })
    return { base: null, children: compact(expanded) }
  }

  /**
   * Slot content is the instance's own layers, saved under a content frame. Component
   * property bindings do not reach into a slot, so its layers expand outside that scope.
   */
  const expandSlotContent = (
    contentId: string,
    descendant: readonly StructuralLayer[],
    rank: number
  ): Subtree => {
    const routed = routeToChildren(contentId, descendant)
    const expanded = (children.get(contentId) ?? []).map((child) => {
      if (!child.guid) throw new Error('Indexed child has no GUID')
      const childId = guidToString(child.guid)
      return expand(childId, [], routed.get(childId) ?? [], rank + 1)
    })
    return { base: null, children: compact(expanded) }
  }

  /** Apply this owner's property layers, then its placed geometry and saved caches. */
  const finishOccurrence = (
    occurrence: InstanceOccurrence,
    base: InstanceOccurrence | null,
    source: NodeChange,
    claims: readonly PropertyLayer[],
    rank: number,
    derived: boolean
  ): void => {
    applyPropertyClaims(claimContext, occurrence, rank, claims)
    applyInstanceLayoutScale(occurrence, source)
    applyPlacedConstraints(occurrence, base, source)
    if (source.type === 'INSTANCE' && source.size)
      occurrence.properties.size = structuredClone(source.size)
    if (derived) applyDerivedBounds(claimContext, occurrence, source)
  }

  if (sources.get(rootId)?.type !== expectedType) {
    const kind = { INSTANCE: 'an instance', SYMBOL: 'a component', CANVAS: 'a page' }[expectedType]
    throw new Error(`Expected ${kind} source`)
  }
  const root = expand(rootId, [], [], 0)
  if (!root) throw new Error(`Cyclic component expansion at ${rootId}`)
  return root
}
