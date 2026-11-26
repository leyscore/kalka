import { uniq } from 'es-toolkit'
import { computed, ref, watch, type Ref } from 'vue'

import {
  narrowLayerChange,
  type DocumentChanges,
  type LayerChange,
  type LayerPropertyGroup,
  type VariableChange
} from '@kalka/scene-graph/diff'
import { useI18n } from '@kalka/vue'

import type { DocumentComparison } from '@/app/document/versions/compare'

/**
 * What Compare changes lists and what a merge takes: layers by page, then components, styles and
 * variables, as Figma's branch review groups them; a tick per change, and per property family
 * within a changed layer.
 */

const GROUP_LABEL = {
  name: 'compareGroupName',
  order: 'compareGroupOrder',
  position: 'compareGroupPosition',
  size: 'compareGroupSize',
  fill: 'compareGroupFill',
  stroke: 'compareGroupStroke',
  effects: 'compareGroupEffects',
  opacity: 'compareGroupOpacity',
  corners: 'compareGroupCorners',
  text: 'compareGroupText',
  layout: 'compareGroupLayout',
  visibility: 'compareGroupVisibility',
  css: 'compareGroupCss',
  other: 'compareGroupOther'
} as const satisfies Record<LayerPropertyGroup, string>

const VARIABLE_FIELD_LABEL: Record<
  string,
  | 'compareGroupName'
  | 'compareVariableValues'
  | 'compareVariableModes'
  | 'compareVariableDescription'
> = {
  name: 'compareGroupName',
  valuesByMode: 'compareVariableValues',
  expressions: 'compareVariableValues',
  modes: 'compareVariableModes',
  defaultModeId: 'compareVariableModes',
  description: 'compareVariableDescription'
}

export interface CompareSection {
  id: string
  name: string
  /** The change to the page itself, shown in its heading. */
  page: LayerChange | null
  changes: LayerChange[]
}

export function useCompareChoices(comparison: Ref<DocumentComparison | null>) {
  const { panels } = useI18n()
  const selectedId = ref<string | null>(null)
  const selectedVariableId = ref<string | null>(null)
  const taken = ref(new Set<string>())
  const takenVariables = ref(new Set<string>())
  /** Property families left out of a ticked layer, by layer. */
  const leftGroups = ref(new Map<string, Set<LayerPropertyGroup>>())

  watch(
    comparison,
    (next) => {
      selectedId.value = next?.changes[0]?.id ?? null
      selectedVariableId.value = selectedId.value ? null : (next?.variables[0]?.id ?? null)
      // A change the other side made too stays theirs until it is ticked.
      const free = (id: string) => !next?.merge?.conflicts.has(id)
      taken.value = new Set(next?.changes.map((change) => change.id).filter(free))
      takenVariables.value = new Set(next?.variables.map((change) => change.id).filter(free))
      leftGroups.value = new Map()
    },
    { immediate: true }
  )

  const pageName = (current: DocumentComparison, id: string) =>
    (current.after.getNode(id) ?? current.before.getNode(id))?.name ?? ''

  const sections = computed<CompareSection[]>(() => {
    const current = comparison.value
    if (!current) return []
    const byPage = new Map<string, LayerChange[]>()
    const components: LayerChange[] = []
    const styles: LayerChange[] = []
    for (const change of current.changes) {
      if (change.asset === 'component') components.push(change)
      else if (change.asset === 'style') styles.push(change)
      else {
        const key = change.pageId ?? ''
        byPage.set(key, [...(byPage.get(key) ?? []), change])
      }
    }
    const pages = [...byPage].map(([pageId, changes]) => ({
      id: pageId,
      name: pageName(current, pageId),
      changes: changes.filter((change) => change.id !== pageId),
      page: changes.find((change) => change.id === pageId) ?? null
    }))
    const assets = [
      { id: 'components', name: panels.value.compareComponents, page: null, changes: components },
      { id: 'styles', name: panels.value.compareStyles, page: null, changes: styles }
    ]
    return [...pages, ...assets.filter((section) => section.changes.length > 0)]
  })

  const selected = computed(
    () => comparison.value?.changes.find((change) => change.id === selectedId.value) ?? null
  )
  const selectedVariable = computed(
    () =>
      comparison.value?.variables.find((change) => change.id === selectedVariableId.value) ?? null
  )

  function select(change: LayerChange) {
    selectedVariableId.value = null
    selectedId.value = change.id
  }

  function selectVariable(change: VariableChange) {
    selectedId.value = null
    selectedVariableId.value = change.id
  }

  const groupLabel = (group: LayerPropertyGroup) => panels.value[GROUP_LABEL[group]]

  function addedOrRemoved(kind: LayerChange['kind']) {
    return kind === 'added' ? panels.value.compareAdded : panels.value.compareRemoved
  }

  function summary(change: LayerChange): string {
    if (change.kind === 'changed') {
      const left = leftGroups.value.get(change.id)
      return change.groups
        .filter((group) => !left?.has(group))
        .map(groupLabel)
        .join(', ')
    }
    const kind = addedOrRemoved(change.kind)
    return change.descendants > 0
      ? panels.value.compareWithInside({ kind, count: change.descendants })
      : kind
  }

  function variableSummary(change: VariableChange): string {
    if (change.kind === 'changed') {
      const labels = change.fields.map(
        (field) => VARIABLE_FIELD_LABEL[field] ?? 'compareGroupOther'
      )
      return uniq(labels)
        .map((label) => panels.value[label])
        .join(', ')
    }
    const kind = addedOrRemoved(change.kind)
    return change.descendants > 0
      ? panels.value.compareWithVariables({ kind, count: change.descendants })
      : kind
  }

  function toggleIn(set: Ref<Set<string>>, id: string, value: boolean) {
    const next = new Set(set.value)
    if (value) next.add(id)
    else next.delete(id)
    set.value = next
  }

  const toggle = (id: string, value: boolean) => toggleIn(taken, id, value)
  const toggleVariable = (id: string, value: boolean) => toggleIn(takenVariables, id, value)

  const takesGroup = (id: string, group: LayerPropertyGroup) =>
    !leftGroups.value.get(id)?.has(group)

  function toggleGroup(change: LayerChange, group: LayerPropertyGroup, value: boolean) {
    const next = new Map(leftGroups.value)
    const left = new Set(next.get(change.id))
    if (value) left.delete(group)
    else left.add(group)
    next.set(change.id, left)
    leftGroups.value = next
    // Ticking a family takes the layer; leaving every family out leaves the layer.
    if (value) toggle(change.id, true)
    else if (change.groups.every((name) => left.has(name))) toggle(change.id, false)
  }

  /** The ticked changes, each layer kept to its ticked families. */
  function chosen(): DocumentChanges {
    const current = comparison.value
    if (!current) return { layers: [], variables: [] }
    const layers = current.changes.flatMap((change) => {
      if (!taken.value.has(change.id)) return []
      const left = leftGroups.value.get(change.id)
      if (!left?.size) return [change]
      const kept = new Set(change.groups.filter((group) => !left.has(group)))
      const narrowed = narrowLayerChange(change, kept)
      return narrowed ? [narrowed] : []
    })
    const variables = current.variables.filter((change) => takenVariables.value.has(change.id))
    return { layers, variables }
  }

  const isEmpty = computed(
    () => !comparison.value?.changes.length && !comparison.value?.variables.length
  )

  return {
    sections,
    selected,
    selectedId,
    selectedVariable,
    selectedVariableId,
    taken,
    takenVariables,
    isEmpty,
    select,
    selectVariable,
    summary,
    variableSummary,
    groupLabel,
    toggle,
    toggleVariable,
    takesGroup,
    toggleGroup,
    chosen
  }
}
