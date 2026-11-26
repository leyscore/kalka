<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, ref, shallowRef, watch } from 'vue'

import type { LayerChange } from '@kalka/scene-graph/diff'
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

import { useCompareChoices } from './useCompareChoices'

/**
 * Compare changes: the layers two states of a document differ by, grouped by page, then its
 * components, styles and variables, each with what changed, and the selected layer drawn before
 * and after, side by side or overlaid. When the comparison leads to a merge, each change has a
 * tick to take it or keep the other side, and a changed layer a tick per property family.
 */
const { panels } = useI18n()
const store = useEditorStore()
const images = chatToolTheme()
const splitter = tv(splitterTheme)({ direction: 'horizontal' })
const row =
  'flex items-start gap-2 rounded-md px-1.5 py-1 text-left text-xs hover:bg-hover data-[selected]:bg-hover'
const dot =
  'mt-1 size-2 shrink-0 rounded-full data-[kind=added]:bg-success data-[kind=changed]:bg-accent data-[kind=removed]:bg-error'

const open = computed({
  get: () => openComparison.value !== null,
  set: (value) => {
    if (!value) closeComparison()
  }
})
const comparison = computed(() => openComparison.value)
const mode = ref<'side' | 'overlay'>('side')
const busy = ref(false)
const error = ref('')
const {
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
} = useCompareChoices(comparison)
watch(comparison, () => (error.value = ''))

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
    const skipped = await current.merge.apply(chosen())
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
        <p v-if="isEmpty" class="text-xs text-muted">
          {{ panels.compareNone }}
        </p>
        <section v-for="page in sections" :key="page.id" class="flex flex-col gap-0.5">
          <h4 class="px-1 text-[11px] font-semibold text-muted">
            {{ page.name }}
            <span v-if="page.page">{{ summary(page.page) }}</span>
          </h4>
          <button
            v-for="change in page.changes"
            :key="change.id"
            type="button"
            :class="row"
            :data-selected="change.id === selectedId || undefined"
            :data-kind="change.kind"
            data-slot="compare-change"
            @click="select(change)"
          >
            <span v-if="comparison.merge" class="flex" data-slot="compare-take" @click.stop>
              <AppCheckbox
                :model-value="taken.has(change.id)"
                :ariaLabel="panels.compareTake({ name: change.name })"
                @update:model-value="toggle(change.id, $event)"
              />
            </span>
            <span :class="dot" :data-kind="change.kind" aria-hidden="true" />
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
        <section v-if="comparison.variables.length" class="flex flex-col gap-0.5">
          <h4 class="px-1 text-[11px] font-semibold text-muted">{{ panels.compareVariables }}</h4>
          <button
            v-for="change in comparison.variables"
            :key="change.id"
            type="button"
            :class="row"
            :data-selected="change.id === selectedVariableId || undefined"
            :data-kind="change.kind"
            data-slot="compare-variable"
            @click="selectVariable(change)"
          >
            <span v-if="comparison.merge" class="flex" data-slot="compare-take" @click.stop>
              <AppCheckbox
                :model-value="takenVariables.has(change.id)"
                :ariaLabel="panels.compareTake({ name: change.name })"
                @update:model-value="toggleVariable(change.id, $event)"
              />
            </span>
            <span :class="dot" :data-kind="change.kind" aria-hidden="true" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-surface">
                {{ change.name }}
                <span v-if="change.entity === 'variable'" class="text-muted">
                  {{ change.collection }}
                </span>
              </span>
              <span class="block truncate text-[11px] text-muted">
                {{ variableSummary(change) }}
              </span>
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
        <fieldset
          v-if="comparison.merge && selected?.kind === 'changed' && selected.groups.length > 1"
          class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
          data-slot="compare-groups"
        >
          <legend class="pb-1 text-[11px] text-muted">{{ panels.compareProperties }}</legend>
          <label
            v-for="group in selected.groups"
            :key="group"
            class="flex items-center gap-1"
            :data-conflict="
              comparison.merge.conflictGroups.get(selected.id)?.has(group) || undefined
            "
          >
            <AppCheckbox
              :model-value="taken.has(selected.id) && takesGroup(selected.id, group)"
              :ariaLabel="panels.compareTakeGroup({ group: groupLabel(group) })"
              @update:model-value="toggleGroup(selected, group, $event)"
            />
            <span
              :class="
                comparison.merge.conflictGroups.get(selected.id)?.has(group) ? 'text-warning' : ''
              "
            >
              {{ groupLabel(group) }}
            </span>
          </label>
        </fieldset>
        <p v-if="selectedVariable" class="text-xs text-muted" data-slot="compare-variable-detail">
          {{ variableSummary(selectedVariable) }}
        </p>
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
