import { mergeVariableConsumptionMaps } from '#fig/node-change/variable/bindings'
import { omit } from 'es-toolkit/object'

import type { GUID, NodeChange } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'

import type { BoundPropertyClaim } from '../bindings/properties'
import { UNINHERITED_COMPONENT_FIELDS } from '../fields'
import type { AssignmentGroup, StructuralLayer } from '../layers'
import { componentKeys, readOverrideKey, type SourceIndex } from '../source-index'
import { assignedSlotContent, type ComponentPropAssignment } from '../types'
import type { InstanceOccurrence } from './types'

/** Where an occurrence's root lands once its own and outer structural layers apply. */
export interface RootResolution {
  effective: GUID | undefined
  /** Components superseded on the way to `effective`, innermost decision first. */
  replaced: GUID[]
  groups: AssignmentGroup[]
  descendant: StructuralLayer[]
}

/** What an occurrence expands to beneath its own record. */
export interface Subtree {
  base: InstanceOccurrence | null
  children: InstanceOccurrence[]
  /** The component is gone; only the record itself remains addressable. */
  dangling?: true
}

function defaultInstanceName(
  { sources }: SourceIndex,
  occurrence: InstanceOccurrence
): string | undefined {
  const source = sources.get(occurrence.sourceId)
  if (source?.type === 'INSTANCE') return occurrence.properties.name
  const parentGuid = source?.parentIndex?.guid
  const parent = parentGuid ? sources.get(guidToString(parentGuid)) : undefined
  return parent?.isStateGroup === true ? parent.name : occurrence.properties.name
}

function namesMissingSlotContent(
  { sources }: SourceIndex,
  assignment: ComponentPropAssignment
): boolean {
  const content = assignedSlotContent(assignment.varValue?.value)
  return !!content && !sources.has(guidToString(content))
}

/** Identity and provenance an occurrence inherits from the subtree it expands. */
function inheritedFromBase(
  { sources }: SourceIndex,
  base: InstanceOccurrence | null
): Pick<
  InstanceOccurrence,
  | 'mainComponentId'
  | 'mainComponentOverrideKey'
  | 'propertyClaims'
  | 'variableBindingScales'
  | 'hasOwnName'
> {
  if (!base) {
    return {
      mainComponentId: null,
      mainComponentOverrideKey: undefined,
      propertyClaims: [],
      variableBindingScales: {},
      hasOwnName: false
    }
  }
  return {
    mainComponentId: base.mainComponentId ?? base.sourceId,
    mainComponentOverrideKey: base.mainComponentOverrideKey ?? base.overrideKey,
    propertyClaims: structuredClone(base.propertyClaims),
    variableBindingScales: { ...base.variableBindingScales },
    hasOwnName: sources.get(base.sourceId)?.type === 'INSTANCE' && base.hasOwnName
  }
}

/** An occurrence from its record, its resolved root, and the subtree it expanded. */
export function createOccurrence(
  index: SourceIndex,
  id: string,
  raw: NodeChange,
  source: NodeChange,
  { effective, replaced, groups }: RootResolution,
  { base, children: expanded }: Subtree,
  bindingClaims: BoundPropertyClaim[]
): InstanceOccurrence {
  const original = raw.symbolData?.symbolID
  const [, sourceComponentOverrideKey] = componentKeys(index, original)
  const occurrence: InstanceOccurrence = {
    sourceId: id,
    sourceComponentId: original,
    sourceComponentOverrideKey,
    ...inheritedFromBase(index, base),
    bindingClaims,
    overrideKey: readOverrideKey(source.overrideKey),
    // The record is the top layer of its own root: its fields are placed state.
    properties: {
      // The component's look carries over; its identity and its place in its own parent do not.
      ...(base && omit(base.properties, UNINHERITED_COMPONENT_FIELDS)),
      ...source,
      ...(effective && source.symbolData
        ? { symbolData: { ...source.symbolData, symbolID: effective } }
        : {}),
      ...mergeVariableConsumptionMaps(base?.properties ?? {}, source)
    },
    children: expanded
  }
  if (source.type === 'INSTANCE')
    occurrence.properties.componentPropAssignments = groups
      .flatMap((g) => g.assignments)
      // A slot whose content frame is gone falls back to its component's content.
      .filter((assignment) => !namesMissingSlotContent(index, assignment))
  // A swapped instance without a name of its own takes the replacement's default name.
  if (base && replaced.length && !occurrence.hasOwnName)
    occurrence.properties.name = base.defaultInstanceName ?? base.properties.name
  occurrence.defaultInstanceName = defaultInstanceName(index, occurrence)
  return occurrence
}
