<script setup lang="ts">
import { RadioGroupRoot } from 'reka-ui'
import { computed } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { ONBOARDING_ROLES, type OnboardingRole } from '@/app/settings/preferences/store'

import WelcomeChoice from './WelcomeChoice.vue'

const role = defineModel<OnboardingRole>({ required: true })
const { welcome } = useI18n()

const choices = computed(() => {
  const w = welcome.value
  const text: Record<OnboardingRole, [string, string]> = {
    design: [w.roleDesign, w.roleDesignHint],
    build: [w.roleBuild, w.roleBuildHint],
    both: [w.roleBoth, w.roleBothHint],
    ai: [w.roleAI, w.roleAIHint]
  }
  return ONBOARDING_ROLES.map((value) => ({ value, label: text[value][0], hint: text[value][1] }))
})
</script>

<template>
  <div>
    <p id="welcome-role-question" class="mb-3 text-[13px] font-semibold text-surface">
      {{ welcome.roleQuestion }}
    </p>
    <RadioGroupRoot
      v-model="role"
      aria-labelledby="welcome-role-question"
      class="flex flex-col gap-2.5"
    >
      <WelcomeChoice
        v-for="choice in choices"
        :key="choice.value"
        :value="choice.value"
        :label="choice.label"
        :hint="choice.hint"
      />
    </RadioGroupRoot>
  </div>
</template>
