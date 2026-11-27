<script setup lang="ts">
import { DialogContent, DialogDescription, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

import { useI18n } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
import {
  closeWelcome,
  closeWelcomeForAIChat,
  nextWelcomeStep,
  previousWelcomeStep,
  WELCOME_STEPS,
  welcomeOpen,
  welcomeStep,
  welcomeStepIndex
} from '@/app/onboarding/welcome'
import { DEFAULT_CALLSIGN } from '@/app/presence/callsigns'
import {
  appPreferences,
  ONBOARDING_DESIGNS,
  ONBOARDING_JOBS,
  ONBOARDING_SOURCES,
  ONBOARDING_TEAM_SIZES,
  updateOnboardingProfile,
  type OnboardingDesign,
  type OnboardingJob,
  type OnboardingSource,
  type OnboardingTeamSize
} from '@/app/settings/preferences/store'
import BrandMark from '@/components/brand/BrandMark.vue'
import PixelSky from '@/components/brand/PixelSky.vue'
import SelectedWord from '@/components/brand/SelectedWord.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import { welcomeScreen } from '@/theme/onboarding'

import WelcomeStepClaude from './WelcomeStepClaude.vue'

const { welcome } = useI18n()
const identity = useCollabIdentity()
const nameInput = useTemplateRef<HTMLInputElement>('nameInput')
const name = ref(identity.hasChosenName.value ? identity.name.value : '')
const profile = computed(() => appPreferences.value.onboarding.profile)
const company = ref(profile.value.company)
const position = ref(profile.value.position)

/** The greeting around the product's name, which is drawn as a selected layer. */
const title = computed(() => {
  const [before = '', ...rest] = welcome.value.title.split('Kalka')
  return { before, after: rest.join('Kalka') }
})
const styles = computed(() =>
  welcomeScreen({ step: welcomeStep.value === 'claude' ? 'claude' : 'start' })
)
const stepIndex = computed(() => welcomeStepIndex(welcomeStep.value))
const progress = computed(() =>
  welcome.value.stepOf({ current: stepIndex.value + 1, total: WELCOME_STEPS.length })
)

const jobs = computed(() => {
  const w = welcome.value
  const labels: Record<OnboardingJob, string> = {
    designer: w.jobDesigner,
    developer: w.jobDeveloper,
    product: w.jobProduct,
    founder: w.jobFounder,
    marketing: w.jobMarketing,
    student: w.jobStudent,
    other: w.jobOther
  }
  return ONBOARDING_JOBS.map((id) => ({ id, label: labels[id] }))
})
const teamSizes = computed(() => {
  const w = welcome.value
  const labels: Record<OnboardingTeamSize, string> = {
    solo: w.teamSolo,
    small: w.teamSmall,
    medium: w.teamMedium,
    large: w.teamLarge,
    larger: w.teamLarger
  }
  return ONBOARDING_TEAM_SIZES.map((id) => ({ id, label: labels[id] }))
})
const designs = computed(() => {
  const w = welcome.value
  const labels: Record<OnboardingDesign, { label: string; hint: string }> = {
    websites: { label: w.designWebsites, hint: w.designWebsitesHint },
    apps: { label: w.designApps, hint: w.designAppsHint },
    brand: { label: w.designBrand, hint: w.designBrandHint },
    systems: { label: w.designSystems, hint: w.designSystemsHint }
  }
  return ONBOARDING_DESIGNS.map((id) => ({ id, ...labels[id] }))
})
const sources = computed(() => {
  const w = welcome.value
  const labels: Record<OnboardingSource, string> = {
    search: w.sourceSearch,
    x: w.sourceX,
    linkedin: w.sourceLinkedin,
    youtube: w.sourceYoutube,
    github: w.sourceGithub,
    producthunt: w.sourceProducthunt,
    friend: w.sourceFriend,
    ai: w.sourceAi,
    other: w.sourceOther
  }
  return ONBOARDING_SOURCES.map((id) => ({ id, label: labels[id] }))
})

/** A second click on the chosen answer takes it back: every answer stays optional. */
function pickJob(job: OnboardingJob): void {
  updateOnboardingProfile({ job: profile.value.job === job ? null : job })
}
function pickTeamSize(teamSize: OnboardingTeamSize): void {
  updateOnboardingProfile({ teamSize: profile.value.teamSize === teamSize ? null : teamSize })
}
function pickSource(source: OnboardingSource): void {
  updateOnboardingProfile({ source: profile.value.source === source ? null : source })
}
function toggleDesign(design: OnboardingDesign): void {
  const current = profile.value.designs
  updateOnboardingProfile({
    designs: current.includes(design)
      ? current.filter((item) => item !== design)
      : [...current, design]
  })
}

/** The name is the one collaborators see, kept on this computer like the rest. */
function keepAnswers(): void {
  if (name.value.trim()) identity.setName(name.value)
  updateOnboardingProfile({ company: company.value.trim(), position: position.value.trim() })
}

function next(): void {
  keepAnswers()
  const step = nextWelcomeStep(welcomeStep.value)
  if (step) welcomeStep.value = step
  else finish()
}

function back(): void {
  keepAnswers()
  const step = previousWelcomeStep(welcomeStep.value)
  if (step) welcomeStep.value = step
}

function connectAgent(): void {
  keepAnswers()
  closeWelcomeForAIChat()
}

function finish(): void {
  keepAnswers()
  closeWelcome()
}

function showMCP(): void {
  keepAnswers()
  welcomeStep.value = 'claude'
}

/** The name is the first thing to fill in, not the skip link that comes first in the page. */
function focusName(event: Event): void {
  if (!nameInput.value) return
  event.preventDefault()
  nameInput.value.focus()
}

// Leaving by Back or a link keeps what was typed, as Skip setup does.
watch(welcomeOpen, (open) => {
  if (!open) keepAnswers()
})

// Each new step starts at its title, for keyboards and screen readers alike.
const column = useTemplateRef<HTMLElement>('column')
watch(welcomeStep, async (step) => {
  if (step === 'start') return
  await nextTick()
  column.value?.querySelector<HTMLElement>('h2')?.focus()
})

function onOpenChange(open: boolean): void {
  if (!open) finish()
}
</script>

<template>
  <DialogRoot :open="welcomeOpen" @update:open="onOpenChange">
    <DialogPortal>
      <DialogContent :class="styles.root()" data-test-id="welcome" @open-auto-focus="focusName">
        <PixelSky />
        <AppButton
          size="lg"
          variant="link"
          :class="styles.skip()"
          data-test-id="welcome-skip"
          @click="finish"
        >
          {{ welcome.skipSetup }}
        </AppButton>

        <form
          v-if="welcomeStep !== 'claude'"
          ref="column"
          :class="styles.column()"
          @submit.prevent="next"
        >
          <div :class="styles.progress()" role="img" :aria-label="progress">
            <span
              v-for="(step, index) in WELCOME_STEPS"
              :key="step"
              :class="styles.progressDot()"
              :data-done="index <= stepIndex"
            />
          </div>

          <template v-if="welcomeStep === 'start'">
            <BrandMark variant="app-icon" decorative :class="styles.mark()" />
            <DialogTitle :class="styles.title()">
              {{ title.before
              }}<SelectedWord :agent="DEFAULT_CALLSIGN" :you="name.trim() || undefined"
                >Kalka</SelectedWord
              >{{ title.after }}
            </DialogTitle>
            <DialogDescription :class="styles.intro()">{{ welcome.intro }}</DialogDescription>
            <div :class="styles.frame()">
              <div :class="styles.card()">
                <div :class="styles.field()">
                  <div :class="styles.labelRow()">
                    <label for="welcome-name" :class="styles.label()">{{
                      welcome.nameLabel
                    }}</label>
                    <Tip :label="welcome.nameHint" side="right">
                      <button type="button" :aria-label="welcome.nameHint" :class="styles.info()">
                        <icon-hugeicons-information-circle class="size-3.5" />
                      </button>
                    </Tip>
                  </div>
                  <input
                    id="welcome-name"
                    ref="nameInput"
                    v-model="name"
                    type="text"
                    name="given-name"
                    autocomplete="given-name"
                    maxlength="40"
                    :placeholder="welcome.namePlaceholder"
                    :class="styles.input()"
                    data-test-id="welcome-name"
                  />
                </div>
                <div :class="styles.nav()">
                  <AppButton
                    type="submit"
                    size="lg"
                    color="primary"
                    variant="solid"
                    :class="styles.primary()"
                    data-test-id="welcome-next"
                  >
                    {{ welcome.continue }}
                  </AppButton>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="welcomeStep === 'about'">
            <DialogTitle tabindex="-1" :class="styles.title()">{{
              welcome.aboutTitle
            }}</DialogTitle>
            <DialogDescription :class="styles.intro()">{{ welcome.aboutIntro }}</DialogDescription>
            <div :class="styles.frame()">
              <div :class="styles.card()">
                <div :class="styles.group()" role="group" aria-labelledby="welcome-job">
                  <span id="welcome-job" :class="styles.label()">{{ welcome.jobLabel }}</span>
                  <div :class="styles.chips()">
                    <button
                      v-for="job in jobs"
                      :key="job.id"
                      type="button"
                      :class="styles.chip()"
                      :data-selected="profile.job === job.id"
                      :aria-pressed="profile.job === job.id"
                      @click="pickJob(job.id)"
                    >
                      {{ job.label }}
                    </button>
                  </div>
                </div>
                <div :class="styles.fields()">
                  <label :class="styles.group()">
                    <span :class="styles.label()">{{ welcome.companyLabel }}</span>
                    <input
                      v-model="company"
                      type="text"
                      name="organization"
                      autocomplete="organization"
                      maxlength="120"
                      :placeholder="welcome.companyPlaceholder"
                      :class="styles.input()"
                    />
                  </label>
                  <label :class="styles.group()">
                    <span :class="styles.label()">{{ welcome.positionLabel }}</span>
                    <input
                      v-model="position"
                      type="text"
                      name="organization-title"
                      autocomplete="organization-title"
                      maxlength="120"
                      :placeholder="welcome.positionPlaceholder"
                      :class="styles.input()"
                    />
                  </label>
                </div>
                <div :class="styles.group()" role="group" aria-labelledby="welcome-team">
                  <span id="welcome-team" :class="styles.label()">{{ welcome.teamSizeLabel }}</span>
                  <div :class="styles.chips()">
                    <button
                      v-for="size in teamSizes"
                      :key="size.id"
                      type="button"
                      :class="styles.chip()"
                      :data-selected="profile.teamSize === size.id"
                      :aria-pressed="profile.teamSize === size.id"
                      @click="pickTeamSize(size.id)"
                    >
                      {{ size.label }}
                    </button>
                  </div>
                </div>
                <div :class="styles.nav()">
                  <AppButton size="lg" variant="link" @click="back">{{ welcome.back }}</AppButton>
                  <div class="flex-1" />
                  <AppButton
                    type="submit"
                    size="lg"
                    color="primary"
                    variant="solid"
                    :class="styles.secondary()"
                    data-test-id="welcome-next"
                  >
                    {{ welcome.continue }}
                  </AppButton>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="welcomeStep === 'design'">
            <DialogTitle tabindex="-1" :class="styles.title()">{{
              welcome.designTitle
            }}</DialogTitle>
            <DialogDescription :class="styles.intro()">{{ welcome.designIntro }}</DialogDescription>
            <div :class="styles.frame()">
              <div :class="styles.card()">
                <div :class="styles.choices()">
                  <button
                    v-for="design in designs"
                    :key="design.id"
                    type="button"
                    :class="styles.choice()"
                    :data-selected="profile.designs.includes(design.id)"
                    :aria-pressed="profile.designs.includes(design.id)"
                    @click="toggleDesign(design.id)"
                  >
                    <span :class="styles.choiceTitle()">{{ design.label }}</span>
                    <span :class="styles.choiceHint()">{{ design.hint }}</span>
                  </button>
                </div>
                <div :class="styles.group()" role="group" aria-labelledby="welcome-source">
                  <span id="welcome-source" :class="styles.label()">{{ welcome.sourceLabel }}</span>
                  <div :class="styles.chips()">
                    <button
                      v-for="source in sources"
                      :key="source.id"
                      type="button"
                      :class="styles.chip()"
                      :data-selected="profile.source === source.id"
                      :aria-pressed="profile.source === source.id"
                      @click="pickSource(source.id)"
                    >
                      {{ source.label }}
                    </button>
                  </div>
                </div>
                <div :class="styles.nav()">
                  <AppButton size="lg" variant="link" @click="back">{{ welcome.back }}</AppButton>
                  <div class="flex-1" />
                  <AppButton
                    type="submit"
                    size="lg"
                    color="primary"
                    variant="solid"
                    :class="styles.secondary()"
                    data-test-id="welcome-next"
                  >
                    {{ welcome.continue }}
                  </AppButton>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <DialogTitle tabindex="-1" :class="styles.title()">{{ welcome.aiTitle }}</DialogTitle>
            <DialogDescription :class="styles.intro()">{{ welcome.aiIntro }}</DialogDescription>
            <div :class="styles.frame()">
              <div :class="styles.card()">
                <div :class="styles.actions()">
                  <div :class="styles.stack()">
                    <AppButton
                      size="lg"
                      color="primary"
                      variant="solid"
                      :class="styles.primary({ class: styles.stacked() })"
                      data-test-id="welcome-continue"
                      @click="connectAgent"
                    >
                      <template #leading><icon-hugeicons-ai-magic class="size-4" /></template>
                      {{ welcome.connectAgent }}
                    </AppButton>
                    <AppButton
                      size="lg"
                      variant="outline"
                      :class="styles.secondary({ class: styles.stacked() })"
                      data-test-id="welcome-mcp"
                      @click="showMCP"
                    >
                      <template #leading><icon-hugeicons-mcp-server class="size-4" /></template>
                      {{ welcome.connectMCP }}
                    </AppButton>
                  </div>
                  <p :class="styles.hint()">{{ welcome.connectAgentHint }}</p>
                </div>
                <div :class="styles.nav()">
                  <AppButton size="lg" variant="link" @click="back">{{ welcome.back }}</AppButton>
                  <!-- The AI is optional: leaving it for later is as visible as connecting it. -->
                  <AppButton
                    size="lg"
                    variant="link"
                    data-test-id="welcome-ai-later"
                    @click="finish"
                  >
                    {{ welcome.aiLater }}
                  </AppButton>
                </div>
              </div>
            </div>
          </template>
        </form>

        <div v-else :class="styles.column()">
          <DialogTitle :class="styles.title()">{{ welcome.claudeTitle }}</DialogTitle>
          <DialogDescription :class="styles.intro()">{{ welcome.claudeIntro }}</DialogDescription>
          <div :class="styles.frame()">
            <div :class="styles.card()"><WelcomeStepClaude /></div>
          </div>
          <footer :class="styles.footer()">
            <AppButton size="lg" variant="link" @click="welcomeStep = 'ai'">
              {{ welcome.back }}
            </AppButton>
            <div class="flex-1" />
            <AppButton
              size="lg"
              color="primary"
              variant="solid"
              class="h-10 rounded-[9px] px-5 text-[13px] font-semibold"
              @click="finish"
            >
              {{ welcome.startDesigning }}
            </AppButton>
          </footer>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
