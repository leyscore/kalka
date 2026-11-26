<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

import { useI18n, useRetainedPopup, useSharedStyles } from '@kalka/vue'

import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import { usePopoverUI } from '@/components/ui/overlay/popover'

import { textStylePreviewStyle, textStyleSummary } from './preview'

/**
 * Figma's Style button in Typography: the document's text styles by folder, each drawn in its own
 * face, a click to apply one, and `+` to make one from the selected text.
 */
const { currentStyleId } = defineProps<{ currentStyleId: string | null }>()
const emit = defineEmits<{ apply: [styleId: string]; create: [name: string] }>()
const { panels } = useI18n()
const { groups, definition } = useSharedStyles('text')
const { open, portalActive } = useRetainedPopup()
const cls = usePopoverUI({
  content: 'flex max-h-[min(28rem,70vh)] w-64 max-w-[calc(100vw-1rem)] flex-col overflow-hidden',
  header: 'flex items-center gap-1.5 border-b border-border px-3 py-2',
  body: 'scrollbar-thin min-h-0 flex-1 overflow-y-auto p-1'
})

const creating = ref(false)
const draftName = ref('')
const query = ref('')
const nameInput = useTemplateRef<{ focus: () => void }>('nameInput')

const shownGroups = computed(() => {
  const search = query.value.trim().toLowerCase()
  if (!search) return groups.value
  return groups.value
    .map((group) => ({
      ...group,
      styles: group.styles.filter((style) => style.name.toLowerCase().includes(search))
    }))
    .filter((group) => group.styles.length > 0)
})

watch(open, (isOpen) => {
  if (isOpen) return
  creating.value = false
  draftName.value = ''
  query.value = ''
})

async function startCreating() {
  creating.value = true
  await nextTick()
  nameInput.value?.focus()
}

function create() {
  const name = draftName.value.trim()
  if (!name) return
  emit('create', name)
  open.value = false
}

function apply(styleId: string) {
  emit('apply', styleId)
  open.value = false
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <IconButton :label="panels.styleLibrary" data-test-id="text-style-picker" :active="open">
        <icon-hugeicons-dashboard-square-01 class="size-3.5" />
      </IconButton>
    </PopoverTrigger>
    <PopoverPortal v-if="portalActive">
      <PopoverContent
        side="bottom"
        align="end"
        :side-offset="4"
        :aria-label="panels.textStyles"
        :class="cls.content"
        data-test-id="text-style-picker-content"
      >
        <div :class="cls.header">
          <h3 class="truncate text-xs font-semibold text-surface">
            {{ creating ? panels.createStyle : panels.textStyles }}
          </h3>
          <IconButton
            v-if="!creating"
            class="ml-auto"
            :label="panels.createStyle"
            data-test-id="text-style-create"
            @click="startCreating"
          >
            <icon-hugeicons-plus-sign class="size-3.5" />
          </IconButton>
        </div>

        <form v-if="creating" class="flex flex-col gap-2 p-3" @submit.prevent="create">
          <AppInput
            ref="nameInput"
            v-model="draftName"
            size="sm"
            tone="panel"
            :aria-label="panels.styleName"
            :placeholder="panels.styleName"
            data-test-id="text-style-name"
          />
          <AppButton
            type="submit"
            color="primary"
            variant="solid"
            size="xs"
            :disabled="!draftName.trim()"
            data-test-id="text-style-create-submit"
          >
            {{ panels.createStyleAction }}
          </AppButton>
        </form>

        <template v-else>
          <div v-if="groups.length > 0" class="border-b border-border p-2">
            <AppInput
              v-model="query"
              type="search"
              size="sm"
              tone="panel"
              :aria-label="panels.searchStyles"
              :placeholder="panels.searchStyles"
            />
          </div>
          <div :class="cls.body">
            <p v-if="groups.length === 0" class="px-2 py-3 text-[11px] text-muted">
              {{ panels.noTextStyles }}
            </p>
            <p v-else-if="shownGroups.length === 0" class="px-2 py-3 text-[11px] text-muted">
              {{ panels.noStylesFound }}
            </p>
            <div v-for="group in shownGroups" :key="group.folder" role="group">
              <div v-if="group.folder" class="px-2 pt-2 pb-1 text-[11px] text-muted">
                {{ group.folder }}
              </div>
              <button
                v-for="style in group.styles"
                :key="style.id"
                type="button"
                class="flex h-8 w-full min-w-0 items-center gap-2 rounded px-2 text-left hover:bg-hover data-[current=true]:bg-hover"
                :data-current="style.id === currentStyleId"
                :data-text-style="style.name"
                @click="apply(style.id)"
              >
                <span
                  class="min-w-0 flex-1 truncate text-surface"
                  :style="textStylePreviewStyle(definition(style.nodeId))"
                  >{{ style.label }}</span
                >
                <span class="shrink-0 text-[11px] text-muted tabular-nums">
                  {{ textStyleSummary(definition(style.nodeId), panels.auto) }}
                </span>
                <icon-hugeicons-tick-02
                  v-if="style.id === currentStyleId"
                  class="size-3.5 shrink-0 text-surface"
                />
              </button>
            </div>
          </div>
        </template>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
