<script setup lang="ts">
import { compact, partition } from 'es-toolkit/array'
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectViewport
} from 'reka-ui'
import { computed, ref } from 'vue'

import { AI_PROVIDERS } from '@kalka/core/constants'
import { useI18n } from '@kalka/vue'

import {
  aiModelSettings,
  designModelProfile,
  designModelProfiles,
  isAgentModelProfile,
  modelConnection,
  setModelRoleAssignment
} from '@/app/ai/models'
import type { AIModelProfile, AIModelProfileId } from '@/app/ai/models'
import { openSettings } from '@/app/settings/open'
import AgentCreature from '@/components/chat/AgentCreature.vue'
import ChatProfileItem from '@/components/chat/ChatProfileItem.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import { useSelectUI } from '@/components/ui/select/select'
import { chatProfileTheme } from '@/theme/chat/profile'

/** `seed` and `color` draw the creature of the agent that answers in this conversation. */
const { seed, color } = defineProps<{ seed: string; color: string }>()
const { ai } = useI18n()
const open = ref(false)
// Kalka's own agent runs on a model; a connected agent brings its own.
const groups = computed(() => {
  const [agents, models] = partition(designModelProfiles(), isAgentModelProfile)
  return [
    { label: ai.value.agentGroupKalka, profiles: models },
    { label: ai.value.agentGroupConnected, profiles: agents }
  ].filter((group) => group.profiles.length > 0)
})
const selectedName = computed(() => designModelProfile.value?.name ?? '')
const selectedMeta = computed(() => {
  const profile = designModelProfile.value
  if (!profile) return ''
  return isAgentModelProfile(profile) ? ai.value.agentGroupConnected : ai.value.agentGroupKalka
})
const ui = chatProfileTheme()
const selectCls = useSelectUI({
  trigger: ui.trigger(),
  content: ui.content(),
  viewport: ui.viewport(),
  item: ui.item(),
  contentVariants: { padding: 'none' }
})

const selectedProfileId = computed({
  get: () => aiModelSettings.value.assignments.design,
  set: (profileId: AIModelProfileId) => setModelRoleAssignment('design', profileId)
})

function profileMetadata(profile: AIModelProfile): string {
  const connection = modelConnection(profile.connectionId)
  const provider = AI_PROVIDERS.find((candidate) => candidate.id === connection?.providerID)
  const modelID = profile.customModelID || profile.modelID
  const modelName = provider?.models.find((model) => model.id === modelID)?.name || modelID
  return compact([modelName, provider?.name ?? connection?.providerID]).join(', ')
}

function manageModels(): void {
  open.value = false
  openSettings('ai')
}
</script>

<template>
  <SelectRoot v-model="selectedProfileId" v-model:open="open">
    <SelectTrigger
      data-test-id="chat-profile-selector"
      :aria-label="ai.selectDesignModel"
      :class="selectCls.trigger"
    >
      <span :class="ui.triggerTile()">
        <AgentCreature :seed="seed" :class="ui.triggerCreature()" :style="{ color }" />
      </span>
      <span :class="ui.triggerName()">{{ selectedName }}</span>
      <span :class="ui.triggerMeta()">{{ selectedMeta }}</span>
      <icon-hugeicons-chevron-down :class="ui.triggerChevron()" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper"
        side="top"
        align="start"
        :side-offset="4"
        :collision-padding="8"
        :class="selectCls.content"
      >
        <SelectViewport :class="selectCls.viewport">
          <SelectGroup v-for="group in groups" :key="group.label">
            <SelectLabel :class="ui.groupLabel()">{{ group.label }}</SelectLabel>
            <SelectItem
              v-for="profile in group.profiles"
              :key="profile.id"
              :value="profile.id"
              :text-value="`${profile.name} ${profileMetadata(profile)}`"
              :class="selectCls.item"
            >
              <SelectItemIndicator :class="ui.indicator()">
                <icon-hugeicons-check :class="ui.indicatorIcon()" />
              </SelectItemIndicator>
              <span v-if="profile.id !== selectedProfileId" :class="ui.indicator()" />
              <SelectItemText as-child>
                <ChatProfileItem :profile="profile" :metadata="profileMetadata(profile)" />
              </SelectItemText>
            </SelectItem>
          </SelectGroup>
          <AppButton class="w-full justify-start" @click="manageModels">
            <template #leading><icon-hugeicons-settings-01 :class="ui.footerIcon()" /></template>
            {{ ai.manageModelsAndRoles }}
          </AppButton>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
