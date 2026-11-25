<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'
import { computed, ref } from 'vue'

import type { VariableType } from '@kalka/scene-graph'
import { useI18n, variablesAddTestId, vTestId } from '@kalka/vue'

import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import { useMenuUI } from '@/components/ui/menu/menu'
import { VARIABLE_TYPE_ICONS, VARIABLE_TYPES } from '@/components/variables/type-icons'

/** `labelled` spells out "Create variable" where the toolbar has room for it. */
const { labelled = false } = defineProps<{ labelled?: boolean }>()
/** `added` follows `add` once the menu has closed, so the owner can take the keyboard then. */
const emit = defineEmits<{ add: [type: VariableType]; added: [] }>()

const { panels, variableTypes: text } = useI18n()
const menu = useMenuUI({ content: 'w-48', item: 'justify-start gap-2' })

const items = computed(() => {
  const labels: Record<VariableType, { label: string; hint: string }> = {
    COLOR: { label: text.value.color, hint: text.value.colorHint },
    FLOAT: { label: text.value.number, hint: text.value.numberHint },
    STRING: { label: text.value.text, hint: text.value.textHint },
    BOOLEAN: { label: text.value.boolean, hint: text.value.booleanHint }
  }
  return VARIABLE_TYPES.map((type) => ({ type, icon: VARIABLE_TYPE_ICONS[type], ...labels[type] }))
})

const adding = ref(false)

function add(type: VariableType) {
  adding.value = true
  emit('add', type)
}

/** After an add the keyboard goes to the new token, not back to this button. */
function afterClose(event: Event) {
  if (!adding.value) return
  adding.value = false
  event.preventDefault()
  emit('added')
}
</script>

<template>
  <DropdownMenuRoot>
    <!-- Reka anchors the menu to the element it mounted with, so a new button needs a new trigger. -->
    <DropdownMenuTrigger :key="String(labelled)" as-child>
      <AppButton v-if="labelled" variant="soft" size="sm" data-test-id="variables-add-variable">
        <template #leading><icon-hugeicons-plus class="size-3.5" /></template>
        {{ panels.createVariable }}
      </AppButton>
      <IconButton
        v-else
        size="sm"
        :label="panels.createVariable"
        data-test-id="variables-add-variable"
      >
        <icon-hugeicons-plus class="size-4" />
      </IconButton>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        side="bottom"
        :side-offset="4"
        align="end"
        :class="menu.content"
        @close-auto-focus="afterClose"
      >
        <DropdownMenuItem
          v-for="item in items"
          :key="item.type"
          :class="menu.item"
          v-test-id="variablesAddTestId(item.type)"
          @select="add(item.type)"
        >
          <component :is="item.icon" :class="menu.icon" />
          <span class="flex min-w-0 flex-1 flex-col">
            <span>{{ item.label }}</span>
            <span class="truncate text-[10px] text-muted">{{ item.hint }}</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
