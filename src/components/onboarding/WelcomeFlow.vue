<script setup lang="ts">
import { DialogContent, DialogDescription, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { computed, ref } from 'vue'

import { useI18n } from '@open-pencil/vue'

import {
  closeWelcome,
  closeWelcomeForAIChat,
  WELCOME_STEPS,
  welcomeOpen,
  welcomeStep
} from '@/app/onboarding/welcome'
import {
  appPreferences,
  updateOnboarding,
  type OnboardingRole
} from '@/app/settings/preferences/store'
import BrandMark from '@/components/brand/BrandMark.vue'
import AppButton from '@/components/ui/button/AppButton.vue'

import WelcomeArt from './WelcomeArt.vue'
import WelcomeStepClaude from './WelcomeStepClaude.vue'
import WelcomeStepPreferences from './WelcomeStepPreferences.vue'
import WelcomeStepRole from './WelcomeStepRole.vue'

const { welcome } = useI18n()
const role = ref<OnboardingRole>(appPreferences.value.onboarding.role ?? 'design')

const index = computed(() => WELCOME_STEPS.indexOf(welcomeStep.value))
const heading = computed(() => {
  const w = welcome.value
  return { role: w.title, preferences: w.preferencesTitle, claude: w.claudeTitle }[
    welcomeStep.value
  ]
})
const intro = computed(() => {
  const w = welcome.value
  return { role: w.intro, preferences: w.preferencesIntro, claude: w.claudeIntro }[
    welcomeStep.value
  ]
})
const width = computed(
  () =>
    ({ role: 'max-w-[520px]', preferences: 'max-w-[880px]', claude: 'max-w-[1180px]' })[
      welcomeStep.value
    ]
)

function go(offset: number): void {
  if (welcomeStep.value === 'role') updateOnboarding({ role: role.value })
  const next = WELCOME_STEPS[index.value + offset]
  if (next) welcomeStep.value = next
  else closeWelcome()
}

function onOpenChange(open: boolean): void {
  if (!open) closeWelcome()
}
</script>

<template>
  <DialogRoot :open="welcomeOpen" @update:open="onOpenChange">
    <DialogPortal>
      <DialogContent
        class="fixed inset-0 z-[45] flex overflow-y-auto bg-canvas text-surface outline-none animate-in fade-in duration-300"
        data-test-id="welcome"
      >
        <div
          v-if="welcomeStep === 'role'"
          class="sticky top-0 hidden h-dvh w-1/2 shrink-0 items-center justify-center bg-brand-blue p-[8%] lg:flex"
        >
          <WelcomeArt class="max-w-[480px] animate-in fade-in zoom-in-95 duration-700" />
        </div>

        <div class="flex min-h-dvh flex-1 flex-col px-6 py-10 sm:px-12 lg:px-16">
          <div
            :key="welcomeStep"
            class="mx-auto flex w-full flex-1 flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-300"
            :class="width"
          >
            <BrandMark
              v-if="welcomeStep === 'role'"
              variant="app-icon"
              decorative
              class="mb-8 size-12"
            />
            <p class="mb-3 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
              {{ welcome.stepOf({ current: index + 1, total: WELCOME_STEPS.length }) }}
            </p>
            <DialogTitle
              class="font-display text-[clamp(32px,4vw,46px)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-surface"
            >
              {{ heading }}
            </DialogTitle>
            <DialogDescription
              class="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-pretty text-muted"
            >
              {{ intro }}
            </DialogDescription>

            <div class="mt-9">
              <WelcomeStepRole v-if="welcomeStep === 'role'" v-model="role" />
              <WelcomeStepPreferences v-else-if="welcomeStep === 'preferences'" />
              <WelcomeStepClaude v-else />
            </div>

            <footer class="mt-10 flex items-center gap-3">
              <AppButton v-if="index > 0" size="lg" variant="link" @click="go(-1)">
                {{ welcome.back }}
              </AppButton>
              <div class="flex flex-1 items-center gap-1.5" :class="index > 0 && 'justify-center'">
                <span
                  v-for="(step, dot) in WELCOME_STEPS"
                  :key="step"
                  class="h-1.5 rounded-full transition-all duration-300"
                  :class="dot === index ? 'w-6 bg-accent' : 'w-1.5 bg-border'"
                />
              </div>
              <AppButton
                v-if="welcomeStep === 'claude'"
                size="lg"
                variant="link"
                @click="closeWelcomeForAIChat"
              >
                {{ welcome.setUpChat }}
              </AppButton>
              <AppButton size="lg" variant="link" data-test-id="welcome-skip" @click="closeWelcome">
                {{ welcomeStep === 'claude' ? welcome.skipForNow : welcome.skipSetup }}
              </AppButton>
              <AppButton
                size="lg"
                color="primary"
                variant="solid"
                class="h-11 rounded-lg px-6 text-sm"
                data-test-id="welcome-continue"
                @click="go(1)"
              >
                {{ welcomeStep === 'claude' ? welcome.startDesigning : welcome.continue }}
              </AppButton>
            </footer>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
