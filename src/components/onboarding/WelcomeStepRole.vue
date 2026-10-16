<script setup lang="ts">
import { RadioGroupRoot } from 'reka-ui'
import { computed } from 'vue'

import { useI18n } from '@kalka/vue'

import { ONBOARDING_ROLES, type OnboardingRole } from '@/app/settings/preferences/store'

import WelcomeChoice from './WelcomeChoice.vue'

const role = defineModel<OnboardingRole>({ required: true })
const name = defineModel<string>('name', { required: true })
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
    <label class="mb-7 block">
      <span class="mb-2 block text-[13px] font-semibold text-surface">{{ welcome.nameLabel }}</span>
      <input
        v-model="name"
        type="text"
        name="given-name"
        autocomplete="given-name"
        maxlength="40"
        :placeholder="welcome.namePlaceholder"
        class="h-11 w-full rounded-[12px] border border-glass-border bg-glass px-4 text-[15px] text-surface backdrop-blur-[24px] transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-muted focus:border-accent/50 focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_14%,transparent)]"
        data-test-id="welcome-name"
      />
      <span class="mt-1.5 block text-xs text-muted">{{ welcome.nameHint }}</span>
    </label>
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
