<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { startWithSample } from '@/app/home/start'
import { startTour } from '@/app/onboarding/tour'
import { openWelcome } from '@/app/onboarding/welcome'
import { homeHeading, learnCard } from '@/theme/home/start'

const { welcome } = useI18n()
const { activeTab: panelTab } = useAIChat()

const tour = learnCard({ mark: 'tour' })
const code = learnCard({ mark: 'code' })
const agent = learnCard({ mark: 'agent' })

async function takeTour(): Promise<void> {
  await startWithSample()
  startTour()
}

async function seeCode(): Promise<void> {
  await startWithSample()
  panelTab.value = 'code'
}
</script>

<template>
  <section aria-labelledby="home-learn-heading" class="flex flex-col gap-3.5">
    <h2 id="home-learn-heading" :class="homeHeading">{{ welcome.learnBasics }}</h2>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2.5">
      <button type="button" :class="tour.root()" @click="takeTour">
        <!-- The brand's quarter shapes, as on the sample file. -->
        <span :class="tour.mark()" aria-hidden="true">
          <span class="rounded-br-full bg-brand-paper" />
          <span />
          <span />
          <span class="rounded-tl-full bg-brand-sky" />
        </span>
        <span :class="tour.body()">
          <span :class="tour.title()">{{ welcome.learnTour }}</span>
          <span :class="tour.hint()">{{ welcome.learnTourHint }}</span>
        </span>
      </button>
      <button type="button" :class="code.root()" @click="seeCode">
        <span :class="code.mark()" aria-hidden="true">
          <icon-lucide-code-xml class="size-[18px]" />
        </span>
        <span :class="code.body()">
          <span :class="code.title()">{{ welcome.learnCode }}</span>
          <span :class="code.hint()">{{ welcome.learnCodeHint }}</span>
        </span>
      </button>
      <button type="button" :class="agent.root()" @click="openWelcome('claude')">
        <span :class="agent.mark()" aria-hidden="true">
          <icon-lucide-sparkle class="size-5" />
        </span>
        <span :class="agent.body()">
          <span :class="agent.title()">{{ welcome.learnClaude }}</span>
          <span :class="agent.hint()">{{ welcome.learnClaudeHint }}</span>
        </span>
      </button>
    </div>
  </section>
</template>
