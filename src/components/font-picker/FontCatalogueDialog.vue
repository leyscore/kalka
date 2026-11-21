<script setup lang="ts">
import { useDropZone, watchDebounced } from '@vueuse/core'
import { computed, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'

import type { CatalogueFont } from '@kalka/core/text'
import { useI18n } from '@kalka/vue'

import AppButton from '@/components/ui/button/AppButton.vue'
import AppDialog from '@/components/ui/dialog/AppDialog.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import AppCheckbox from '@/components/ui/toggle/AppCheckbox.vue'

export interface AddedFiles {
  /** Files that are no font, by name. */
  rejected: string[]
}

const {
  search,
  loadPreview,
  addFont,
  addFiles,
  addedFamilies,
  canInstall = false,
  initialQuery = '',
  initialPreview = ''
} = defineProps<{
  /** Families of the free catalogue whose name holds the query. */
  search: (query: string, signal: AbortSignal) => Promise<CatalogueFont[]>
  /** Loads a family's face so its preview draws in it. */
  loadPreview?: (family: string) => void
  addFont: (font: CatalogueFont, options: { install: boolean }) => Promise<void>
  addFiles: (files: File[], options: { install: boolean }) => Promise<AddedFiles>
  /** Families the document carries already. */
  addedFamilies: readonly string[]
  /** Offers to install fonts on the computer too, in the desktop app. */
  canInstall?: boolean
  initialQuery?: string
  /** The person's own text to preview fonts on, such as the selected layer's. */
  initialPreview?: string
}>()

const open = defineModel<boolean>('open', { default: false })
const { fonts: messages, common } = useI18n()
const installLabel = useId()

const query = ref(initialQuery)
const preview = ref(initialPreview)
const install = ref(false)
const results = shallowRef<CatalogueFont[]>([])
const searching = ref(false)
const failed = ref(false)
const adding = ref(new Set<string>())
const addError = ref<string | null>(null)
const rejected = ref<string[]>([])
const addedOwnFiles = ref(false)
let controller: AbortController | null = null

const sample = computed(() => preview.value.trim() || messages.value.previewSample)
const added = computed(() => new Set(addedFamilies))

async function runSearch() {
  controller?.abort()
  const current = new AbortController()
  controller = current
  searching.value = true
  failed.value = false
  try {
    const found = await search(query.value, current.signal)
    if (current.signal.aborted) return
    results.value = found
    for (const font of found.slice(0, 24)) loadPreview?.(font.family)
  } catch {
    if (!current.signal.aborted) {
      results.value = []
      failed.value = true
    }
  } finally {
    if (controller === current) searching.value = false
  }
}

watch(open, (isOpen) => {
  if (!isOpen) {
    controller?.abort()
    return
  }
  query.value = initialQuery
  preview.value = initialPreview
  addError.value = null
  rejected.value = []
  addedOwnFiles.value = false
  void runSearch()
})

watchDebounced(query, () => open.value && void runSearch(), { debounce: 200 })

async function add(font: CatalogueFont) {
  if (adding.value.has(font.family)) return
  adding.value = new Set(adding.value).add(font.family)
  addError.value = null
  try {
    await addFont(font, { install: install.value })
  } catch (error) {
    addError.value = messages.value.fontAddFailed({
      family: font.family,
      error: error instanceof Error ? error.message : String(error)
    })
  } finally {
    const next = new Set(adding.value)
    next.delete(font.family)
    adding.value = next
  }
}

function weightsLabel(font: CatalogueFont) {
  if (font.variable) return messages.value.variable
  return font.weights.length === 1
    ? messages.value.oneWeight
    : messages.value.weightCount({ count: font.weights.length })
}

const dropZone = useTemplateRef<HTMLElement>('dropZone')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

async function takeFiles(files: File[] | null) {
  if (!files || files.length === 0) return
  addError.value = null
  try {
    const result = await addFiles(files, { install: install.value })
    rejected.value = result.rejected
    addedOwnFiles.value = result.rejected.length < files.length
  } catch (error) {
    addError.value = error instanceof Error ? error.message : String(error)
  }
}

const { isOverDropZone } = useDropZone(dropZone, {
  onDrop: (files) => void takeFiles(files),
  multiple: true,
  preventDefaultForUnhandled: true
})

function chooseFiles(event: Event) {
  const input = event.target as HTMLInputElement
  void takeFiles(input.files ? [...input.files] : null)
  input.value = ''
}
</script>

<template>
  <AppDialog
    v-model:open="open"
    size="md"
    :heading="messages.addFontTitle"
    :description="messages.addFontDescription"
  >
    <div class="flex flex-col gap-3">
      <div class="grid grid-cols-[3fr_2fr] gap-2">
        <AppInput
          v-model="query"
          type="search"
          autofocus
          size="md"
          :aria-label="messages.searchCatalogue"
          :placeholder="messages.searchCataloguePlaceholder"
        >
          <template #leading><icon-hugeicons-search-01 class="size-3.5 text-muted" /></template>
        </AppInput>
        <AppInput
          v-model="preview"
          size="md"
          :aria-label="messages.previewText"
          :placeholder="messages.previewText"
        >
          <template #leading><icon-hugeicons-text class="size-3.5 text-muted" /></template>
        </AppInput>
      </div>

      <AppAlert v-if="failed" tone="warning" :heading="messages.catalogueUnavailable" />
      <AppAlert v-if="addError" tone="error" :heading="addError" />

      <ul
        v-if="results.length > 0"
        :aria-label="messages.searchCatalogue"
        :aria-busy="searching"
        class="-mx-1 max-h-80 overflow-y-auto"
      >
        <li
          v-for="font in results"
          :key="font.id"
          class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-hover"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 text-[11px] text-muted">
              <span class="truncate font-medium text-surface">{{ font.family }}</span>
              <span class="shrink-0 rounded bg-input px-1.5 py-px">{{ font.license }}</span>
              <span class="shrink-0">{{ weightsLabel(font) }}</span>
            </div>
            <p
              class="mt-0.5 truncate text-xl leading-snug text-surface"
              :style="{ fontFamily: `'${font.family}', var(--font-sans)` }"
            >
              {{ sample }}
            </p>
          </div>
          <AppButton
            v-if="added.has(font.family)"
            size="sm"
            variant="ghost"
            disabled
            :aria-label="`${messages.addedToDocument}: ${font.family}`"
          >
            <icon-hugeicons-tick-02 class="size-3.5" />
            {{ messages.addedToDocument }}
          </AppButton>
          <AppButton
            v-else
            size="sm"
            variant="soft"
            color="primary"
            :loading="adding.has(font.family)"
            :aria-label="`${messages.addToDocument}: ${font.family}`"
            @click="add(font)"
          >
            {{ adding.has(font.family) ? messages.adding : messages.addToDocument }}
          </AppButton>
        </li>
      </ul>
      <p v-else-if="!searching && !failed" class="py-6 text-center text-xs text-muted">
        {{ messages.noCatalogueResults }}
      </p>

      <div
        ref="dropZone"
        :data-over="isOverDropZone || undefined"
        class="flex items-center gap-3 rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted transition-colors data-over:border-primary data-over:bg-accent/5"
      >
        <icon-hugeicons-upload-02 class="size-4 shrink-0" />
        <span class="min-w-0 flex-1">{{ messages.dropFonts }}</span>
        <AppButton size="sm" variant="outline" @click="fileInput?.click()">
          {{ messages.chooseFiles }}
        </AppButton>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".woff2,.woff,.ttf,.otf,.txt"
          class="hidden"
          :aria-label="messages.chooseFiles"
          @change="chooseFiles"
        />
      </div>
      <AppAlert v-if="addedOwnFiles" tone="info" :heading="messages.ownFontsLicense" />
      <AppAlert
        v-if="rejected.length > 0"
        tone="warning"
        :heading="messages.filesRejected({ names: rejected.join(', ') })"
      />
    </div>

    <template #footer>
      <label v-if="canInstall" class="me-auto flex items-center gap-2 text-xs text-surface">
        <AppCheckbox v-model="install" :ariaLabelledby="installLabel" />
        <span :id="installLabel">{{ messages.installOnComputer }}</span>
      </label>
      <AppButton size="md" variant="solid" color="primary" @click="open = false">
        {{ common.done }}
      </AppButton>
    </template>
  </AppDialog>
</template>
