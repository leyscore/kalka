<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onClickOutside } from '@vueuse/core'

import ScrubInput from '@/components/ScrubInput.vue'
import { useNodeProps } from '@/composables/use-node-props'
import { listFamilies, loadFont } from '@/engine/fonts'

const { store, node, updateProp, commitProp } = useNodeProps()

const fontPickerOpen = ref(false)
const fontSearch = ref('')
const fontFamilies = ref<string[]>([])
const fontPickerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

onClickOutside(fontPickerRef, () => {
  fontPickerOpen.value = false
})

const filteredFamilies = computed(() => {
  const q = fontSearch.value.toLowerCase()
  if (!q) return fontFamilies.value
  return fontFamilies.value.filter((f) => f.toLowerCase().includes(q))
})

const WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'ExtraLight' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'SemiBold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'ExtraBold' },
  { value: 900, label: 'Black' }
]

const currentWeightLabel = computed(
  () => WEIGHTS.find((w) => w.value === node.value.fontWeight)?.label ?? 'Regular'
)

type TextAlign = 'LEFT' | 'CENTER' | 'RIGHT'

async function openFontPicker() {
  fontPickerOpen.value = true
  fontSearch.value = node.value.fontFamily
  if (fontFamilies.value.length === 0) {
    fontFamilies.value = await listFamilies()
  }
  requestAnimationFrame(() => {
    searchInputRef.value?.focus()
    searchInputRef.value?.select()
  })
}

async function selectFamily(family: string) {
  await loadFont(family, currentWeightLabel.value)
  store.updateNodeWithUndo(node.value.id, { fontFamily: family }, 'Change font')
  store.requestRender()
  fontPickerOpen.value = false
}

async function selectWeight(weight: number) {
  const label = WEIGHTS.find((w) => w.value === weight)?.label ?? 'Regular'
  await loadFont(node.value.fontFamily, label)
  store.updateNodeWithUndo(node.value.id, { fontWeight: weight }, 'Change font weight')
  store.requestRender()
}

function setAlign(align: 'LEFT' | 'CENTER' | 'RIGHT') {
  store.updateNodeWithUndo(node.value.id, { textAlignHorizontal: align }, 'Change text alignment')
  store.requestRender()
}

onMounted(async () => {
  await loadFont(node.value.fontFamily, currentWeightLabel.value)
})
</script>

<template>
  <div v-if="node" class="border-b border-border px-3 py-2">
    <label class="mb-1.5 block text-[11px] text-muted">Typography</label>

    <!-- Font family picker -->
    <div ref="fontPickerRef" class="relative mb-1.5">
      <button
        class="flex w-full cursor-pointer items-center justify-between rounded border border-border bg-input px-2 py-1 text-xs text-surface hover:bg-hover"
        @click="openFontPicker"
      >
        <span class="truncate">{{ node.fontFamily }}</span>
        <icon-lucide-chevron-down class="size-3 shrink-0 text-muted" />
      </button>

      <!-- Font picker dropdown -->
      <div
        v-if="fontPickerOpen"
        class="absolute top-full right-0 left-0 z-20 mt-0.5 flex max-h-64 flex-col rounded-md border border-border bg-panel shadow-lg"
      >
        <div class="flex items-center gap-1 border-b border-border px-2 py-1">
          <icon-lucide-search class="size-3 shrink-0 text-muted" />
          <input
            ref="searchInputRef"
            v-model="fontSearch"
            class="min-w-0 flex-1 border-none bg-transparent text-xs text-surface outline-none placeholder:text-muted"
            placeholder="Search fonts…"
            @keydown.escape="fontPickerOpen = false"
            @keydown.enter="filteredFamilies.length && selectFamily(filteredFamilies[0])"
          />
        </div>
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="family in filteredFamilies"
            :key="family"
            class="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-2 py-1.5 text-left text-xs hover:bg-hover"
            :class="family === node.fontFamily ? 'text-accent' : 'text-surface'"
            :style="{ fontFamily: family }"
            @click="selectFamily(family)"
          >
            <icon-lucide-check v-if="family === node.fontFamily" class="size-3 shrink-0" />
            <span v-else class="size-3 shrink-0" />
            <span class="truncate">{{ family }}</span>
          </button>
          <div
            v-if="filteredFamilies.length === 0"
            class="px-2 py-3 text-center text-xs text-muted"
          >
            No fonts found
          </div>
        </div>
      </div>
    </div>

    <!-- Weight + Size -->
    <div class="mb-1.5 flex gap-1.5">
      <select
        class="min-w-0 flex-1 cursor-pointer rounded border border-border bg-input px-1.5 py-1 text-xs text-surface"
        :value="node.fontWeight"
        @change="selectWeight(+($event.target as HTMLSelectElement).value)"
      >
        <option v-for="w in WEIGHTS" :key="w.value" :value="w.value">{{ w.label }}</option>
      </select>
      <ScrubInput
        class="flex-1"
        :model-value="node.fontSize"
        :min="1"
        :max="1000"
        @update:model-value="updateProp('fontSize', $event)"
        @commit="(v: number, p: number) => commitProp('fontSize', v, p)"
      />
    </div>

    <!-- Line height + Letter spacing -->
    <div class="mb-1.5 flex gap-1.5">
      <ScrubInput
        class="flex-1"
        :model-value="node.lineHeight ?? Math.round((node.fontSize || 14) * 1.2)"
        :min="0"
        @update:model-value="updateProp('lineHeight', $event)"
        @commit="(v: number, p: number) => commitProp('lineHeight', v, p)"
      >
        <template #icon>
          <icon-lucide-baseline class="size-3" />
        </template>
      </ScrubInput>
      <ScrubInput
        class="flex-1"
        suffix="%"
        :model-value="node.letterSpacing"
        @update:model-value="updateProp('letterSpacing', $event)"
        @commit="(v: number, p: number) => commitProp('letterSpacing', v, p)"
      >
        <template #icon>
          <icon-lucide-a-large-small class="size-3" />
        </template>
      </ScrubInput>
    </div>

    <!-- Text alignment -->
    <div class="flex gap-0.5">
      <button
        v-for="align in ['LEFT', 'CENTER', 'RIGHT'] as TextAlign[]"
        :key="align"
        class="flex cursor-pointer items-center justify-center rounded border px-2 py-1"
        :class="
          node.textAlignHorizontal === align
            ? 'border-accent bg-accent text-white'
            : 'border-border bg-input text-muted hover:bg-hover hover:text-surface'
        "
        @click="setAlign(align)"
      >
        <icon-lucide-align-left v-if="align === 'LEFT'" class="size-3.5" />
        <icon-lucide-align-center v-else-if="align === 'CENTER'" class="size-3.5" />
        <icon-lucide-align-right v-else class="size-3.5" />
      </button>
    </div>
  </div>
</template>
