<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { reasoningDisplay } from '@/app/ai/chat/preferences'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsRow from '@/components/settings/layout/SettingsRow.vue'
import SettingsSectionHeader from '@/components/settings/layout/SettingsSectionHeader.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

const { ai } = useI18n()
const options = computed(() => [
  { value: 'collapsed' as const, label: ai.value.reasoningCollapsed },
  { value: 'while-thinking' as const, label: ai.value.reasoningWhileThinking },
  { value: 'expanded' as const, label: ai.value.reasoningExpanded }
])
</script>

<template>
  <section class="flex flex-col gap-4">
    <SettingsSectionHeader>{{ ai.chatSettings }}</SettingsSectionHeader>
    <SettingsGroup>
      <SettingsRow :label="ai.reasoningDisplay" class="max-sm:flex-col max-sm:items-stretch">
        <AppSelect
          v-model="reasoningDisplay"
          :label="ai.reasoningDisplay"
          :options="options"
          class="w-full sm:w-52"
        />
      </SettingsRow>
    </SettingsGroup>
  </section>
</template>
