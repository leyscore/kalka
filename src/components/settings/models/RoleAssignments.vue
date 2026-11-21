<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '@kalka/vue'

import { useModelRoleAssignments } from '@/app/ai/models/settings/assignments'
import { AI_MODEL_ROLES, type AIModelRole } from '@/app/ai/models/types'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsRow from '@/components/settings/layout/SettingsRow.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

import { useModelRoleLabels } from './role-labels'

/** The roles to show, all of them by default. */
const { roles = AI_MODEL_ROLES } = defineProps<{ roles?: readonly AIModelRole[] }>()
const { ai } = useI18n()

const roleLabel = useModelRoleLabels()
const roleDefinitions = computed(() => roles.map((role) => ({ role, ...roleLabel(role) })))

const { assignmentValue, optionsForRole, updateAssignment } = useModelRoleAssignments(ai)
</script>

<template>
  <SettingsGroup>
    <SettingsRow
      v-for="definition in roleDefinitions"
      :key="definition.role"
      class="max-sm:flex-col max-sm:items-stretch"
      :label="definition.label"
      :description="definition.description"
      :data-model-role="definition.role"
    >
      <AppSelect
        class="w-full sm:w-52"
        :model-value="assignmentValue(definition.role)"
        :options="optionsForRole(definition.role)"
        :label="definition.label"
        :data-test-id="`settings-model-assignment-${definition.role}`"
        @update:model-value="updateAssignment(definition.role, String($event))"
      />
    </SettingsRow>
  </SettingsGroup>
</template>
