<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

import { FIND_LAYER_KINDS, type FindLayerKind, type FindMatch } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'
import { useCommonMessages, useFindMessages } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { useFindSession } from '@/app/editor/find/session'
import { matchSnippet } from '@/app/editor/find/snippet'
import { closeFind, findState, type FindScope } from '@/app/editor/find/state'
import { nodeIcon } from '@/app/editor/icons'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import AppCheckbox from '@/components/ui/toggle/AppCheckbox.vue'
import { findPanel } from '@/theme/find-panel'

/**
 * Figma's find and replace (⌘F) in the left sidebar: text and layer names on this page or every
 * page, results grouped by top-level layer, Enter and Shift+Enter to move through them, and
 * replacing in text one result at a time or all at once.
 */
const store = useEditorStore()
const messages = useFindMessages()
const common = useCommonMessages()
const styles = findPanel()
const session = useFindSession(store)
const { matches, current } = session

const searchInput = useTemplateRef<HTMLInputElement>('search-input')
const list = useTemplateRef<HTMLElement>('list')
const showFilters = ref(false)
/** What the last replacement did, until the search changes. */
const replacedCount = ref<number | null>(null)

const {
  query,
  replacement,
  showReplace,
  scope,
  text,
  names,
  matchCase,
  wholeWord,
  kinds,
  focusRequest
} = findState

const scopeModel = computed({
  get: () => scope.value,
  set: (value: string) => {
    scope.value = value === 'document' ? 'document' : 'page'
  }
})
const scopeOptions = computed(() => [
  { value: 'page' satisfies FindScope, label: messages.value.currentPage },
  { value: 'document' satisfies FindScope, label: messages.value.allPages }
])

const KIND_LABELS = {
  text: 'kindText',
  frame: 'kindFrame',
  section: 'kindSection',
  component: 'kindComponent',
  instance: 'kindInstance',
  group: 'kindGroup',
  shape: 'kindShape',
  image: 'kindImage'
} as const satisfies Record<FindLayerKind, keyof typeof messages.value>

function toggleKind(kind: FindLayerKind) {
  kinds.value = kinds.value.includes(kind)
    ? kinds.value.filter((found) => found !== kind)
    : [...kinds.value, kind]
}

interface ResultRow {
  index: number
  match: FindMatch
  node: SceneNode
  snippet: { before: string; match: string; after: string }
}

interface ResultGroup {
  key: string
  title: string
  page: string | null
  rows: ResultRow[]
}

const groups = computed<ResultGroup[]>(() => {
  const result: ResultGroup[] = []
  matches.value.forEach((match, index) => {
    const node = store.graph.getNode(match.nodeId)
    if (!node) return
    const value = match.field === 'text' ? node.text : node.name
    const key = `${match.pageId}:${match.frameId}`
    let group = result.at(-1)
    if (group?.key !== key) {
      group = {
        key,
        title: store.graph.getNode(match.frameId)?.name ?? '',
        page: scope.value === 'document' ? (store.graph.getNode(match.pageId)?.name ?? '') : null,
        rows: []
      }
      result.push(group)
    }
    group.rows.push({ index, match, node, snippet: matchSnippet(value, match.start, match.end) })
  })
  return result
})

const status = computed(() => {
  if (replacedCount.value !== null) return messages.value.replaced(replacedCount.value)
  const total = matches.value.length
  if (!query.value) return ''
  if (total === 0) return messages.value.noResults
  if (current.value < 0) return messages.value.results(total)
  return messages.value.position({ current: String(current.value + 1), total: String(total) })
})

watch([query, replacement, scope, text, names, matchCase, wholeWord, kinds], () => {
  replacedCount.value = null
})

function focusSearch() {
  void nextTick(() => {
    searchInput.value?.focus()
    searchInput.value?.select()
  })
}

onMounted(focusSearch)
watch(focusRequest, focusSearch)

watch(current, async (index) => {
  await nextTick()
  list.value?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: 'nearest' })
})

function onSearchKeydown(event: KeyboardEvent) {
  if (event.code === 'Enter' || event.code === 'NumpadEnter') {
    event.preventDefault()
    void session.step(event.shiftKey ? -1 : 1)
  } else if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
    event.preventDefault()
    void session.step(event.code === 'ArrowDown' ? 1 : -1)
  } else if (event.code === 'Escape') {
    event.preventDefault()
    closeFind()
  }
}

async function replaceOne() {
  replacedCount.value = await session.replaceCurrent()
}

async function replaceAll() {
  replacedCount.value = await session.replaceAll()
}

function onReplaceKeydown(event: KeyboardEvent) {
  if (event.code === 'Enter' || event.code === 'NumpadEnter') {
    event.preventDefault()
    void ((event.metaKey || event.ctrlKey) && event.altKey ? replaceAll() : replaceOne())
  } else if (event.code === 'Escape') {
    event.preventDefault()
    closeFind()
  }
}
</script>

<template>
  <section :class="styles.root()" data-test-id="find-panel" :aria-label="messages.title">
    <header :class="styles.header()">
      <h3 :class="styles.title()">{{ messages.title }}</h3>
      <IconButton :label="common.close" data-test-id="find-close" @click="closeFind">
        <icon-hugeicons-cancel-01 class="size-3.5" />
      </IconButton>
    </header>
    <div :class="styles.controls()">
      <div :class="styles.fieldRow()">
        <label :class="styles.field()">
          <icon-hugeicons-search-01 :class="styles.fieldIcon()" aria-hidden="true" />
          <input
            ref="search-input"
            v-model="query"
            type="search"
            data-test-id="find-input"
            :class="styles.input()"
            :aria-label="messages.search"
            :placeholder="messages.searchPlaceholder"
            @keydown="onSearchKeydown"
          />
        </label>
        <IconButton
          :label="messages.filters"
          :active="showFilters"
          data-test-id="find-filters-toggle"
          @click="showFilters = !showFilters"
        >
          <icon-hugeicons-filter-horizontal class="size-3.5" />
        </IconButton>
        <IconButton
          :label="messages.toggleReplace"
          :active="showReplace"
          data-test-id="find-replace-toggle"
          @click="showReplace = !showReplace"
        >
          <icon-hugeicons-search-replace class="size-3.5" />
        </IconButton>
      </div>
      <div v-if="showFilters" :class="styles.filters()" data-test-id="find-filters">
        <SegmentedControl v-model="scopeModel" :options="scopeOptions" :label="messages.scope" />
        <span :class="styles.filterLabel()">{{ messages.lookIn }}</span>
        <label :class="styles.check()">
          <AppCheckbox v-model="text" :ariaLabel="messages.textContent" />
          {{ messages.textContent }}
        </label>
        <label :class="styles.check()">
          <AppCheckbox v-model="names" :ariaLabel="messages.layerNames" />
          {{ messages.layerNames }}
        </label>
        <label :class="styles.check()">
          <AppCheckbox v-model="matchCase" :ariaLabel="messages.matchCase" />
          {{ messages.matchCase }}
        </label>
        <label :class="styles.check()">
          <AppCheckbox v-model="wholeWord" :ariaLabel="messages.wholeWord" />
          {{ messages.wholeWord }}
        </label>
        <span :class="styles.filterLabel()">{{ messages.layerTypes }}</span>
        <div :class="styles.kinds()" role="group" :aria-label="messages.layerTypes">
          <button
            v-for="kind in FIND_LAYER_KINDS"
            :key="kind"
            type="button"
            :class="styles.kind()"
            :data-state="kinds.includes(kind) ? 'on' : 'off'"
            :aria-pressed="kinds.includes(kind)"
            @click="toggleKind(kind)"
          >
            {{ messages[KIND_LABELS[kind]] }}
          </button>
        </div>
      </div>
      <template v-if="showReplace">
        <label :class="styles.field()">
          <icon-hugeicons-text-font :class="styles.fieldIcon()" aria-hidden="true" />
          <input
            v-model="replacement"
            type="text"
            data-test-id="find-replacement"
            :class="styles.input()"
            :aria-label="messages.replacement"
            :placeholder="messages.replacementPlaceholder"
            @keydown="onReplaceKeydown"
          />
        </label>
        <div :class="styles.replaceActions()">
          <AppButton
            size="xs"
            variant="soft"
            data-test-id="find-replace-one"
            :disabled="session.textMatchCount.value === 0"
            @click="replaceOne"
          >
            {{ messages.replace }}
          </AppButton>
          <AppButton
            size="xs"
            variant="soft"
            data-test-id="find-replace-all"
            :disabled="session.textMatchCount.value === 0"
            @click="replaceAll"
          >
            {{ messages.replaceAll }}
          </AppButton>
        </div>
      </template>
      <div :class="styles.status()">
        <span :class="styles.statusText()" role="status" data-test-id="find-status">
          {{ status }}
        </span>
        <IconButton
          :label="messages.previous"
          :disabled="matches.length === 0"
          data-test-id="find-previous"
          @click="session.step(-1)"
        >
          <icon-hugeicons-arrow-up-01 class="size-3.5" />
        </IconButton>
        <IconButton
          :label="messages.next"
          :disabled="matches.length === 0"
          data-test-id="find-next"
          @click="session.step(1)"
        >
          <icon-hugeicons-arrow-down-01 class="size-3.5" />
        </IconButton>
      </div>
    </div>
    <div v-if="!query" :class="styles.empty()">
      <icon-hugeicons-search-01 :class="styles.emptyIcon()" aria-hidden="true" />
      <p :class="styles.emptyText()">{{ messages.hint }}</p>
    </div>
    <div v-else ref="list" :class="styles.list()" data-test-id="find-results">
      <section v-for="group in groups" :key="group.key" :class="styles.group()">
        <h4 :class="styles.groupHeader()">
          <span v-if="group.page" :class="styles.groupPage()">{{ group.page }} /</span>
          <span :class="styles.groupTitle()">{{ group.title }}</span>
        </h4>
        <button
          v-for="row in group.rows"
          :key="row.match.key"
          type="button"
          :class="styles.row()"
          :data-index="row.index"
          :data-field="row.match.field"
          :data-current="row.index === current || undefined"
          :aria-current="row.index === current ? 'true' : undefined"
          data-test-id="find-result"
          @click="session.goTo(row.index)"
        >
          <component :is="nodeIcon(row.node)" :class="styles.rowIcon()" aria-hidden="true" />
          <span :class="styles.rowText()"
            >{{ row.snippet.before }}<mark :class="styles.mark()">{{ row.snippet.match }}</mark
            >{{ row.snippet.after }}</span
          >
          <span v-if="row.match.field === 'name'" :class="styles.rowTag()">
            {{ messages.layerName }}
          </span>
        </button>
      </section>
    </div>
  </section>
</template>
