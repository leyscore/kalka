<script setup lang="ts">
import { computed, ref } from 'vue'

import { WEB_FONT_PROVIDER_IDS, type CatalogueFont, type FontFamilyOption } from '@kalka/core/text'
import { FontPickerRoot, useEditorEvent, useI18n } from '@kalka/vue'
import type { FontPickerUI } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import {
  listFamilies,
  loadFont,
  localFontAccessState,
  requestLocalFontAccess
} from '@/app/editor/fonts'
import { addCatalogueFont, addFontFiles, searchCatalogue } from '@/app/editor/fonts/project'
import { toast } from '@/app/shell/ui'
import { isTauri } from '@/app/tauri/env'
import FontCatalogueDialog from '@/components/font-picker/FontCatalogueDialog.vue'
import { usePopoverUI } from '@/components/ui/overlay/popover'
import { useSelectUI } from '@/components/ui/select/select'

const { panels, fonts: fontMessages } = useI18n()
const { label: labelProp, preview } = defineProps<{
  label?: string
  /** Shows a hovered family on the canvas; `null` when the list closes or a family is chosen. */
  preview?: (family: string | null) => void
}>()
const label = computed(() => labelProp ?? panels.value.fontFamily)
const modelValue = defineModel<string>({ required: true })
const emit = defineEmits<{ select: [family: string] }>()

const store = useEditorStore()

const cls = usePopoverUI({
  content: 'w-[var(--reka-combobox-trigger-width)] min-w-56 overflow-hidden p-0'
})
const selectCls = useSelectUI({
  trigger: 'w-full rounded px-2 py-1 text-xs',
  item: 'w-full gap-2 px-3 py-2.5 text-sm leading-tight'
})

const ui = computed<FontPickerUI>(() => ({
  trigger: selectCls.trigger,
  content: cls.content,
  item: selectCls.item,
  search:
    'w-full border-b border-border bg-transparent px-3 py-2 text-sm text-surface outline-none placeholder:text-muted',
  empty: 'px-2 py-3 text-center text-xs text-muted',
  emptyAction: 'mt-2 rounded bg-accent px-2 py-1 text-xs font-medium text-white disabled:opacity-50'
}))

const previewFontLoads = new Set<string>()

const localFontAccess = {
  state: localFontAccessState,
  load: requestLocalFontAccess
}

/** Bumped when the document's own fonts change, so the list shows them. */
const fontsRevision = ref(0)
useEditorEvent('fonts:changed', () => fontsRevision.value++)
useEditorEvent('graph:replaced', () => fontsRevision.value++)

const documentFamilies = computed(() => {
  void fontsRevision.value
  return [...store.graph.fonts.keys()]
})

/** The families the host lists, with the document's own fonts marked as the document's. */
async function listWithDocumentFonts(): Promise<FontFamilyOption[]> {
  const own = new Set(documentFamilies.value)
  const listed = (await listFamilies()).filter((option) => !own.has(option.family))
  const ownOptions = [...own].map((family): FontFamilyOption => ({ family, source: 'project' }))
  return [...ownOptions, ...listed].sort((a, b) => a.family.localeCompare(b.family))
}

function sourceLabel(source: string) {
  return source === 'project' ? fontMessages.value.documentSource : source
}

function loadPreviewFont(family: string, source: string) {
  if (!WEB_FONT_PROVIDER_IDS.includes(source as (typeof WEB_FONT_PROVIDER_IDS)[number])) return
  loadCataloguePreview(family)
}

function loadCataloguePreview(family: string) {
  if (previewFontLoads.has(family)) return
  previewFontLoads.add(family)
  void loadFont(family)
}

const catalogueOpen = ref(false)
const catalogueQuery = ref('')

/** The selected text, to preview fonts on the person's own words. */
const selectedText = computed(() => {
  for (const id of store.state.selectedIds) {
    const node = store.graph.getNode(id)
    if (node?.type === 'TEXT' && node.text.trim()) return node.text.trim().slice(0, 80)
  }
  return ''
})

function openCatalogue(query: string, close: () => void) {
  close()
  catalogueQuery.value = query
  catalogueOpen.value = true
}

async function addFromCatalogue(font: CatalogueFont, { install }: { install: boolean }) {
  await addCatalogueFont(store, font, { install })
  toast.info(fontMessages.value.fontAdded({ family: font.family }))
  modelValue.value = font.family
  emit('select', font.family)
}

async function addFiles(files: File[], { install }: { install: boolean }) {
  const { fonts, rejected } = await addFontFiles(store, files, { install })
  const first = fonts[0]
  if (first) {
    modelValue.value = first.family
    emit('select', first.family)
  }
  return { rejected }
}
</script>

<template>
  <FontPickerRoot
    v-model="modelValue"
    data-test-id="font-picker-root"
    :list-families="listWithDocumentFonts"
    :refresh-key="fontsRevision"
    :local-font-access="localFontAccess"
    :ui="ui"
    :search-placeholder="panels.searchFonts"
    :empty-search-text="panels.noFontsFound"
    :empty-fonts-text="panels.noLocalFontsAvailable"
    :empty-fonts-hint="panels.localFontsAccessHint"
    @select="emit('select', $event)"
    @highlight="preview?.($event)"
  >
    <template #trigger>
      <button
        type="button"
        data-test-id="font-picker-trigger"
        :aria-label="label"
        :class="selectCls.trigger"
      >
        <span class="truncate">{{ modelValue }}</span>
        <icon-hugeicons-chevron-down class="size-3 shrink-0 text-muted" />
      </button>
    </template>

    <template #item="{ family, selected, source }">
      <div
        data-test-id="font-picker-item"
        class="flex min-w-0 flex-1 items-center gap-2"
        @vue:mounted="loadPreviewFont(family, source)"
      >
        <icon-hugeicons-check v-if="selected" class="size-3 shrink-0 text-primary" />
        <span v-else class="size-3 shrink-0" />
        <span class="truncate" :style="{ fontFamily: `'${family}', sans-serif` }">{{
          family
        }}</span>
        <span
          class="font-sans ml-auto shrink-0 rounded bg-input px-1.5 py-0.5 text-[9px] uppercase text-muted"
        >
          {{ sourceLabel(source) }}
        </span>
      </div>
    </template>

    <template #footer="{ searchTerm, close }">
      <div class="flex flex-col border-t border-border p-1">
        <button
          v-if="searchTerm"
          type="button"
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-surface hover:bg-hover"
          @click="openCatalogue(searchTerm, close)"
        >
          <icon-hugeicons-search-01 class="size-3.5 shrink-0 text-muted" />
          <span class="truncate">{{ fontMessages.searchCatalogueFor({ query: searchTerm }) }}</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-surface hover:bg-hover"
          @click="openCatalogue('', close)"
        >
          <icon-hugeicons-add-01 class="size-3.5 shrink-0 text-muted" />
          <span>{{ fontMessages.addFont }}</span>
        </button>
      </div>
    </template>
  </FontPickerRoot>

  <FontCatalogueDialog
    v-model:open="catalogueOpen"
    :search="searchCatalogue"
    :load-preview="loadCataloguePreview"
    :add-font="addFromCatalogue"
    :add-files="addFiles"
    :added-families="documentFamilies"
    :can-install="isTauri()"
    :initial-query="catalogueQuery"
    :initial-preview="selectedText"
  />
</template>
