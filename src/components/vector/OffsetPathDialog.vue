<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { OffsetPathJoin } from '@kalka/core/canvas'
import { useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { applyOffsetPath, offsetPathOpen } from '@/app/editor/vector/offset-dialog'
import AppButton from '@/components/ui/button/AppButton.vue'
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogRoot
} from '@/components/ui/dialog'
import AppInput from '@/components/ui/input/AppInput.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'

const store = useEditorStore()
const { menu, common } = useI18n()
const offset = ref<string | number>(10)
const join = ref<string>('MITER')
const JOINS: readonly OffsetPathJoin[] = ['MITER', 'ROUND', 'BEVEL']

const joinOptions = computed(() => [
  { value: 'MITER', label: menu.value.offsetPathJoinMiter },
  { value: 'ROUND', label: menu.value.offsetPathJoinRound },
  { value: 'BEVEL', label: menu.value.offsetPathJoinBevel }
])
const distance = computed(() => Number(offset.value))
const canApply = computed(() => Number.isFinite(distance.value) && distance.value !== 0)

watch(offsetPathOpen, (open) => {
  if (open) offset.value = 10
})

async function submit() {
  if (!canApply.value) return
  const chosen = JOINS.find((value) => value === join.value) ?? 'MITER'
  offsetPathOpen.value = false
  await applyOffsetPath(store, distance.value, chosen)
}
</script>

<template>
  <AppDialogRoot v-model:open="offsetPathOpen" size="sm">
    <AppDialogHeader :heading="menu.offsetPathHeading" :close-label="common.close" />
    <AppDialogBody>
      <div class="flex flex-col gap-3">
        <label class="flex items-center gap-3 text-xs text-muted">
          <span class="w-20 shrink-0">{{ menu.offsetPathDistance }}</span>
          <AppInput
            v-model="offset"
            type="number"
            :step="1"
            autofocus
            data-test-id="offset-path-distance"
            :aria-label="menu.offsetPathDistance"
            @enter="submit"
          />
        </label>
        <div class="flex items-center gap-3 text-xs text-muted">
          <span class="w-20 shrink-0">{{ menu.offsetPathCorners }}</span>
          <SegmentedControl v-model="join" :options="joinOptions" :label="menu.offsetPathCorners" />
        </div>
      </div>
    </AppDialogBody>
    <AppDialogFooter>
      <AppButton size="md" @click="offsetPathOpen = false">{{ common.cancel }}</AppButton>
      <AppButton
        size="md"
        color="primary"
        variant="solid"
        :disabled="!canApply"
        data-test-id="offset-path-apply"
        @click="submit"
      >
        {{ common.apply }}
      </AppButton>
    </AppDialogFooter>
  </AppDialogRoot>
</template>
