import { watchDebounced } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'

import type { FindMatch, FindOptions } from '@kalka/core/editor'

import type { EditorStore } from '@/app/editor/active-store'
import { focusNodesOnTheirPage } from '@/app/editor/selection/focus'

import { findState } from './state'

const SEARCH_DELAY_MS = 120

/**
 * The find panel's results on the active document: searched again as the query, its options or
 * the document change, with the result the person is on and the moves and replacements Figma's
 * find offers.
 */
export function useFindSession(store: EditorStore) {
  const matches = shallowRef<FindMatch[]>([])
  /** The result the person is on; -1 before they move to one. */
  const current = ref(-1)
  let searchRun = 0

  const options = computed<FindOptions>(() => ({
    query: findState.query.value,
    text: findState.text.value,
    names: findState.names.value,
    matchCase: findState.matchCase.value,
    wholeWord: findState.wholeWord.value,
    kinds: findState.kinds.value
  }))

  async function search(): Promise<void> {
    const run = ++searchRun
    const currentKey = matches.value[current.value]?.key
    if (!options.value.query) {
      matches.value = []
      current.value = -1
      return
    }
    let pageIds: string[] | undefined = [store.state.currentPageId]
    if (findState.scope.value === 'document') {
      pageIds = undefined
      // Pages imported from a file load their layers on first visit; search needs them now.
      for (const page of store.graph.getPages()) await store.loadPageNodes(page.id)
      if (run !== searchRun) return
    }
    const found = store.findInDocument(options.value, pageIds)
    matches.value = found
    const kept = currentKey ? found.findIndex((match) => match.key === currentKey) : -1
    current.value = kept !== -1 ? kept : Math.min(current.value, found.length - 1)
  }

  watchDebounced(
    [options, findState.scope, () => store.state.currentPageId, () => store.state.sceneVersion],
    () => void search(),
    { debounce: SEARCH_DELAY_MS, immediate: true, deep: true }
  )
  // A new query starts from the first result again.
  watch(
    () => findState.query.value,
    () => {
      current.value = -1
    }
  )

  /** Text being typed into ends before find selects or rewrites layers, as a click away would. */
  function endTextEdit() {
    if (store.state.editingTextId) store.commitTextEdit()
  }

  async function goTo(index: number): Promise<void> {
    const match = index < 0 ? undefined : matches.value[index]
    if (!match) return
    endTextEdit()
    current.value = index
    await focusNodesOnTheirPage(store, [match.nodeId])
  }

  function step(direction: 1 | -1): Promise<void> {
    const total = matches.value.length
    if (total === 0) return Promise.resolve()
    const from = current.value < 0 ? (direction === 1 ? -1 : 0) : current.value
    return goTo((from + direction + total) % total)
  }

  const replaceOptions = () => ({
    query: findState.query.value,
    matchCase: findState.matchCase.value,
    wholeWord: findState.wholeWord.value
  })

  /** Replaces the result the person is on, or the first text result, then moves to the next. */
  async function replaceCurrent(): Promise<number> {
    const index = matches.value.findIndex(
      (match, at) => at >= Math.max(current.value, 0) && match.field === 'text'
    )
    const match = index === -1 ? undefined : matches.value[index]
    if (!match) return 0
    endTextEdit()
    const replaced = store.replaceTextMatches(
      [match],
      findState.replacement.value,
      replaceOptions()
    )
    await search()
    // What took the replaced result's place, or the next text result after it.
    const next = matches.value.findIndex((found, at) => at >= index && found.field === 'text')
    if (next !== -1) await goTo(next)
    else current.value = -1
    return replaced
  }

  /** Replaces every text result in one undo step. */
  async function replaceAll(): Promise<number> {
    endTextEdit()
    const replaced = store.replaceTextMatches(
      matches.value,
      findState.replacement.value,
      replaceOptions()
    )
    await search()
    current.value = -1
    return replaced
  }

  const textMatchCount = computed(
    () => matches.value.filter((match) => match.field === 'text').length
  )

  return { matches, current, textMatchCount, search, goTo, step, replaceCurrent, replaceAll }
}
