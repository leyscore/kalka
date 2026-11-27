<script setup lang="ts">
import { computed, ref } from 'vue'

import { FONT_WEIGHT_NAMES, styleToWeight } from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import { useMissingDocumentFonts } from '@/app/editor/fonts/missing'
import { useDocumentFontStatus } from '@/app/editor/fonts/status'
import { toast } from '@/app/shell/ui'
import FontPicker from '@/components/font-picker/FontPicker.vue'
import MissingFontsPrompt from '@/components/font-status/MissingFontsPrompt.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

const { fonts } = useI18n()
const expanded = ref(false)
const { status, retrying, retry, selectAffectedNodes } = useDocumentFontStatus()
const missing = useMissingDocumentFonts(status)
// A family offered for download is not an issue to fix by hand while it is offered.
const issues = computed(() =>
  status.value.issues.filter((issue) => !missing.offered.value.includes(issue.family))
)
const weights = Object.entries(FONT_WEIGHT_NAMES).map(([value, label]) => ({
  value: Number(value),
  label
}))
type Issue = (typeof issues.value)[number]
const issueKey = (issue: Issue) => `${issue.family}:${issue.style}`

/**
 * A replacement under way: the family picked for one face, and the style to set it in, the
 * face's own weight until another is chosen.
 */
const pending = ref<{ key: string; family: string; weight: number } | null>(null)

function pick(issue: Issue, family: string) {
  pending.value = { key: issueKey(issue), family, weight: styleToWeight(issue.style) }
}

async function addMissing() {
  if (await missing.addAll()) toast.info(fonts.value.missingFontsAdded)
}

function replace(issue: Issue) {
  const choice = pending.value
  if (!choice) return
  pending.value = null
  missing.replaceFace(issue, choice.family, choice.weight)
  const to = `${choice.family} ${FONT_WEIGHT_NAMES[choice.weight] ?? ''}`.trim()
  toast.info(fonts.value.fontReplaced({ from: `${issue.family} ${issue.style}`, to }))
}
</script>

<template>
  <MissingFontsPrompt
    :families="missing.offered.value"
    :adding="missing.adding.value"
    :error="missing.failed.value"
    @add="addMissing"
    @dismiss="missing.dismiss"
  />
  <div
    v-if="issues.length > 0"
    data-test-id="font-status-banner"
    class="mx-2 mt-2 overflow-hidden rounded-[10px] border border-warning-border bg-panel shadow-[inset_0_0_0_100vmax_var(--color-warning-bg)] text-xs text-warning-text backdrop-blur-[28px]"
  >
    <div class="flex items-center gap-2 px-3 py-1.5">
      <icon-hugeicons-triangle-alert class="size-3.5 shrink-0" />
      <button
        type="button"
        data-test-id="font-status-toggle"
        class="min-w-0 flex-1 text-left font-medium"
        @click="expanded = !expanded"
      >
        {{ issues.length === 1 ? fonts.issueFound : fonts.issuesFound({ count: issues.length }) }}
      </button>
      <button
        type="button"
        data-test-id="font-status-select"
        class="shrink-0 rounded-md px-1.5 py-0.5 font-medium text-warning-action transition-colors hover:bg-amber-500/20"
        @click="selectAffectedNodes"
      >
        {{ fonts.selectAffectedLayers }}
      </button>
      <button
        type="button"
        data-test-id="font-status-retry"
        class="shrink-0 rounded-md px-1.5 py-0.5 font-medium text-warning-action transition-colors hover:bg-amber-500/20 disabled:opacity-50"
        :disabled="retrying"
        @click="retry"
      >
        {{ retrying ? fonts.retrying : fonts.retry }}
      </button>
      <button
        type="button"
        :aria-label="expanded ? fonts.collapseIssues : fonts.expandIssues"
        class="flex size-5 shrink-0 items-center justify-center rounded-md hover:bg-amber-500/20"
        @click="expanded = !expanded"
      >
        <icon-hugeicons-chevron-up v-if="expanded" class="size-3.5" />
        <icon-hugeicons-chevron-down v-else class="size-3.5" />
      </button>
    </div>

    <div v-if="expanded" class="grid gap-1 border-t border-warning-border px-3 py-2">
      <div
        v-for="issue in issues"
        :key="`${issue.family}:${issue.style}`"
        data-test-id="font-status-issue"
        class="flex min-w-0 items-center gap-2"
      >
        <span class="min-w-0 flex-1 truncate">
          <strong>{{ issue.family }} {{ issue.style }}</strong>
          <template v-if="issue.substituteFamily"> → {{ issue.substituteFamily }} </template>
          <template v-else>— {{ fonts.noSubstitute }}</template>
          <Tip v-if="issue.reason === 'unsupported-format'" :label="fonts.unsupportedFormat">
            <span class="ms-1 opacity-75">· {{ fonts.unsupportedFormatShort }}</span>
          </Tip>
        </span>
        <span class="shrink-0 text-[10px] opacity-75">
          {{
            issue.nodeIds.length === 1
              ? fonts.affectedLayer
              : fonts.affectedLayerCount({ count: issue.nodeIds.length })
          }}
        </span>
        <template v-if="pending?.key === issueKey(issue)">
          <AppSelect
            :label="fonts.replacementStyle({ family: pending.family })"
            :model-value="pending.weight"
            :options="weights"
            :display-label="`${pending.family} ${FONT_WEIGHT_NAMES[pending.weight] ?? ''}`"
            class="max-w-40"
            @update:model-value="pending && (pending.weight = Number($event))"
          />
          <button
            type="button"
            class="shrink-0 rounded-md px-1.5 py-0.5 font-medium text-warning-action transition-colors hover:bg-amber-500/20"
            @click="replace(issue)"
          >
            {{ fonts.replaceApply }}
          </button>
        </template>
        <!-- A family the computer lacks, or only one of its styles: either can be replaced. -->
        <FontPicker
          v-else
          :model-value="issue.family"
          :label="fonts.replaceFontWith({ family: `${issue.family} ${issue.style}` })"
          @select="pick(issue, $event)"
        >
          <template #trigger="{ label }">
            <button
              type="button"
              :aria-label="label"
              class="shrink-0 rounded-md px-1.5 py-0.5 font-medium text-warning-action transition-colors hover:bg-amber-500/20"
            >
              {{ fonts.replaceFont }}
            </button>
          </template>
        </FontPicker>
      </div>
    </div>
  </div>
</template>
