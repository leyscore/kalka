<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '@kalka/vue'

import { setEditingPreference } from '@/app/settings/preferences/apply'
import {
  appPreferences,
  updateEditingPreferences,
  type NudgePreferences
} from '@/app/settings/preferences/store'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import AppSwitch from '@/components/ui/toggle/AppSwitch.vue'

const { settings } = useI18n()

const keepToolSelected = computed({
  get: () => appPreferences.value.editing.keepToolSelected,
  set: (enabled: boolean) => setEditingPreference('keepToolSelected', enabled)
})

const renameDuplicates = computed({
  get: () => appPreferences.value.editing.renameDuplicates,
  set: (enabled: boolean) => setEditingPreference('renameDuplicates', enabled)
})

/** A nudge step as typed, kept only when it is a usable distance. */
function nudgeModel(key: keyof NudgePreferences) {
  return computed<string | number>({
    get: () => appPreferences.value.editing.nudge[key],
    set: (value) => {
      const amount = Number(value)
      if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) return
      updateEditingPreferences({ nudge: { ...appPreferences.value.editing.nudge, [key]: amount } })
    }
  })
}

const smallNudge = nudgeModel('small')
const largeNudge = nudgeModel('large')
</script>

<template>
  <SettingsGroup>
    <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
      <span>
        <span class="block text-[13px] text-surface">{{ settings.keepToolSelected }}</span>
        <span class="mt-0.5 block text-xs text-muted">{{
          settings.keepToolSelectedDescription
        }}</span>
      </span>
      <AppSwitch
        v-model="keepToolSelected"
        :label="settings.keepToolSelected"
        data-test-id="settings-keep-tool-selected"
      />
    </label>
    <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
      <span>
        <span class="block text-[13px] text-surface">{{ settings.renameDuplicatedLayers }}</span>
        <span class="mt-0.5 block text-xs text-muted">{{
          settings.renameDuplicatedLayersDescription
        }}</span>
      </span>
      <AppSwitch
        v-model="renameDuplicates"
        :label="settings.renameDuplicatedLayers"
        data-test-id="settings-rename-duplicates"
      />
    </label>
    <div
      class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5"
      data-test-id="settings-nudge-amount"
    >
      <span>
        <span class="block text-[13px] text-surface">{{ settings.nudgeAmount }}</span>
        <span class="mt-0.5 block text-xs text-muted">{{ settings.nudgeAmountDescription }}</span>
      </span>
      <span class="flex shrink-0 items-center gap-2">
        <AppInput
          v-model="smallNudge"
          type="number"
          :min="0.01"
          :step="1"
          :aria-label="settings.smallNudge"
          class="w-16"
          data-test-id="settings-nudge-small"
        />
        <AppInput
          v-model="largeNudge"
          type="number"
          :min="0.01"
          :step="1"
          :aria-label="settings.bigNudge"
          class="w-16"
          data-test-id="settings-nudge-large"
        />
      </span>
    </div>
  </SettingsGroup>
</template>
