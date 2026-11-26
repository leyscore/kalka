<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, ref, shallowRef, watch } from 'vue'

import type { LayerChange, LayerPropertyGroup } from '@kalka/scene-graph/diff'
import { useI18n } from '@kalka/vue'

import { renderToolChangeImages } from '@/app/ai/tools/changes/images'
import type { ToolChangeImages } from '@/app/ai/tools/changes/types'
import { closeComparison, openComparison } from '@/app/document/versions/compare'
import { useEditorStore } from '@/app/editor/active-store'
import { focusNodesOnTheirPage } from '@/app/editor/selection/focus'
import { toast } from '@/app/shell/ui'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppDialog from '@/components/ui/dialog/AppDialog.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppCheckbox from '@/components/ui/toggle/AppCheckbox.vue'
import { chatToolTheme } from '@/theme/chat/tool'
import splitterTheme from '@/theme/splitter'

/**
 * Compare changes: the layers two states of a document differ by, grouped by page, each with
 * what changed, and the selected one drawn before and after, side by side or overlaid. When the
 * comparison leads to a merge, each change has a tick to take it or keep the other side.
 */
const { panels } = useI18n()
const store = useEditorStore()
const images = chatToolTheme()
const splitter = tv(splitterTheme)({ direction: 'horizontal' })

const open = computed({
  get: () => openComparison.value !== null,
  set: (value) => {
    if (!value) closeComparison()
  }
})
const comparison = computed(() => openComparison.value)
const selectedId = ref<string | null>(null)
const taken = ref(new Set<string>())
const mode = ref<'side' | 'overlay'>('side')
const busy = ref(false)
const error = ref('')

watch(
  comparison,
  (next) => {
    selectedId.value = next?.changes[0]?.id ?? null
    // A change the other side made too stays theirs until it is ticked.
    taken.value = new Set(
      next?.changes.filter((change) => !next.merge?.conflicts.has(change.id)).map((c) => c.id)
    )
    error.value = ''
  },
  { immediate: true }
)

const pages = computed(() => {
  const current = comparison.value
  if (!current) return []
  const byPage = new Map<string, LayerChange[]>()
  for (const change of current.changes) {
    const key = change.pageId ?? ''
    byPage.set(key, [...(byPage.get(key) ?? []), change])
  }
  return [...byPage].map(([pageId, changes]) => ({
    id: pageId,
    name: (current.after.getNode(pageId) ?? current.before.getNode(pageId))?.name ?? '',
    changes: changes.filter((change) => change.id !== pageId),
    page: changes.find((change) => change.id === pageId) ?? null
  }))
})

const selected = computed(
  () => comparison.value?.changes.find((change) => change.id === selectedId.value) ?? null
)

const preview = shallowRef<ToolChangeImages | null>(null)
const rendering = ref(false)
watch(selected, async (change) => {
  preview.value = null
  const current = comparison.value
  if (!change || !current || !change.pageId || change.type === 'CANVAS') return
  rendering.value = true
  try {
    const result = await renderToolChangeImages(store, {
      beforeGraph: current.before,
      afterGraph: current.after,
      pageId: change.pageId,
      nodeIds: [change.id],
      size: 'large'
    })
    if (selected.value === change) preview.value = result
  } finally {
    if (selected.value === change) rendering.value = false
  }
})
const beforeURL = useObjectUrl(() => preview.value?.before ?? undefined)
const afterURL = useObjectUrl(() => preview.value?.after ?? undefined)
const aspectRatio = computed(() =>
  preview.value && preview.value.height > 0
    ? `${preview.value.width} / ${preview.value.height}`
    : undefined
)

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

function summary(change: LayerChange): string {
  if (change.kind === 'changed')
    return change.groups.map((group) => panels.value[GROUP_LABEL[group]]).join(', ')
  const kind = change.kind === 'added' ? panels.value.compareAdded : panels.value.compareRemoved
  return change.descendants > 0
    ? panels.value.compareWithInside({ kind, count: change.descendants })
    : kind
}

function toggle(id: string, value: boolean) {
  const next = new Set(taken.value)
  if (value) next.add(id)
  else next.delete(id)
  taken.value = next
}

function showOnCanvas(change: LayerChange) {
  closeComparison()
  void focusNodesOnTheirPage(store, [change.id])
}

async function apply() {
  const current = comparison.value
  if (!current?.merge || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const chosen = current.changes.filter((change) => taken.value.has(change.id))
    const skipped = await current.merge.apply(chosen)
    if (skipped.length > 0) toast.info(panels.value.compareSkipped({ count: skipped.length }))
    closeComparison()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AppDialog
    v-model:open="open"
    size="xl"
    :heading="
      comparison?.merge?.kind === 'update'
        ? panels.compareUpdateTitle
        : comparison?.merge
          ? panels.compareMergeTitle
          : panels.compareTitle
    "
    :description="
      comparison
        ? panels.compareBetween({ before: comparison.beforeLabel, after: comparison.afterLabel })
        : ''
    "
    :close-label="panels.versionsCancel"
    data-test-id="compare-changes"
  >
    <div v-if="comparison" class="flex min-h-80 gap-4">
      <div class="flex w-72 shrink-0 flex-col gap-2 overflow-y-auto">
        <p v-if="!comparison.changes.length" class="text-xs text-muted">
          {{ panels.compareNone }}
        </p>
        <section v-for="page in pages" :key="page.id" class="flex flex-col gap-0.5">
          <h4 class="px-1 text-[11px] font-semibold text-muted">
            {{ page.name }}
            <span v-if="page.page">{{ summary(page.page) }}</span>
          </h4>
          <button
            v-for="change in page.changes"
            :key="change.id"
            type="button"
            class="flex items-start gap-2 rounded-md px-1.5 py-1 text-left text-xs hover:bg-hover data-[selected]:bg-hover"
            :data-selected="change.id === selectedId || undefined"
            :data-kind="change.kind"
            data-slot="compare-change"
            @click="selectedId = change.id"
          >
            <span v-if="comparison.merge" class="flex" data-slot="compare-take" @click.stop>
              <AppCheckbox
                :model-value="taken.has(change.id)"
                :ariaLabel="panels.compareTake({ name: change.name })"
                @update:model-value="toggle(change.id, $event)"
              />
            </span>
            <span
              class="mt-1 size-2 shrink-0 rounded-full data-[kind=added]:bg-success data-[kind=changed]:bg-accent data-[kind=removed]:bg-error"
              :data-kind="change.kind"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-surface">{{ change.name }}</span>
              <span class="block truncate text-[11px] text-muted">{{ summary(change) }}</span>
              <span
                v-if="comparison.merge?.conflicts.has(change.id)"
                class="block text-[11px] text-warning"
                data-slot="compare-conflict"
              >
                {{ panels.compareConflict({ name: comparison.merge.otherSide }) }}
              </span>
            </span>
          </button>
        </section>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div v-if="selected" class="flex items-center gap-1">
          <AppButton
            size="xs"
            :variant="mode === 'side' ? 'solid' : 'ghost'"
            :aria-pressed="mode === 'side'"
            data-test-id="compare-side"
            @click="mode = 'side'"
          >
            {{ panels.compareSideBySide }}
          </AppButton>
          <AppButton
            size="xs"
            :variant="mode === 'overlay' ? 'solid' : 'ghost'"
            :aria-pressed="mode === 'overlay'"
            data-test-id="compare-overlay"
            @click="mode = 'overlay'"
          >
            {{ panels.compareOverlay }}
          </AppButton>
          <span class="flex-1" />
          <AppButton
            v-if="comparison.afterIsOpen && selected.kind !== 'removed'"
            size="xs"
            variant="ghost"
            data-test-id="compare-show"
            @click="showOnCanvas(selected)"
          >
            {{ panels.compareShowOnCanvas }}
          </AppButton>
        </div>
        <p v-if="rendering" class="text-xs text-muted">{{ panels.compareRendering }}</p>
        <div
          v-else-if="preview && mode === 'side'"
          class="grid grid-cols-2 gap-2"
          data-slot="compare-side"
        >
          <figure v-for="side in ['before', 'after'] as const" :key="side" class="min-w-0">
            <figcaption class="pb-1 text-[11px] text-muted">
              {{ side === 'before' ? comparison.beforeLabel : comparison.afterLabel }}
            </figcaption>
            <img
              v-if="side === 'before' ? beforeURL : afterURL"
              :src="side === 'before' ? beforeURL : afterURL"
              :alt="side === 'before' ? comparison.beforeLabel : comparison.afterLabel"
              :class="images.image()"
            />
            <p v-else class="text-xs text-muted">
              {{ side === 'before' ? panels.compareAdded : panels.compareRemoved }}
            </p>
          </figure>
        </div>
        <div
          v-else-if="preview"
          :class="images.compare()"
          :style="{ aspectRatio }"
          data-slot="compare-overlay"
        >
          <SplitterGroup direction="horizontal" :class="images.compareSplit()">
            <SplitterPanel :default-size="50" :class="images.comparePanel()">
              <img
                v-if="beforeURL"
                :src="beforeURL"
                :alt="comparison.beforeLabel"
                :class="images.compareBefore()"
              />
              <span :class="images.compareLabel({ class: 'left-1' })">
                {{ comparison.beforeLabel }}
              </span>
            </SplitterPanel>
            <SplitterResizeHandle :class="splitter.handle()" :aria-label="panels.compareOverlay">
              <div :class="splitter.divider({ class: images.compareDivider() })" />
            </SplitterResizeHandle>
            <SplitterPanel :default-size="50" :class="images.comparePanel()">
              <img
                v-if="afterURL"
                :src="afterURL"
                :alt="comparison.afterLabel"
                :class="images.compareAfter()"
              />
              <span :class="images.compareLabel({ class: 'right-1' })">
                {{ comparison.afterLabel }}
              </span>
            </SplitterPanel>
          </SplitterGroup>
        </div>
        <p v-else-if="selected" class="text-xs text-muted">{{ panels.compareNoPreview }}</p>
      </div>
    </div>
    <AppAlert v-if="error" tone="error" :heading="error" class="mt-3" />
    <template v-if="comparison?.merge" #footer>
      <AppButton variant="ghost" @click="closeComparison()">{{ panels.versionsCancel }}</AppButton>
      <AppButton
        color="primary"
        variant="solid"
        :loading="busy"
        data-test-id="compare-apply"
        @click="apply"
      >
        {{
          comparison.merge.kind === 'update' ? panels.compareUpdateApply : panels.compareMergeApply
        }}
      </AppButton>
    </template>
  </AppDialog>
</template>
