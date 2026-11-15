<script setup lang="ts">
import { DialogContent, DialogDescription, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { computed, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
import {
  closeWelcome,
  closeWelcomeForAIChat,
  welcomeOpen,
  welcomeStep
} from '@/app/onboarding/welcome'
import BrandMark from '@/components/brand/BrandMark.vue'
import AppBackdrop from '@/components/shell/AppBackdrop.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import { welcomeScreen } from '@/theme/onboarding'

import WelcomeStepClaude from './WelcomeStepClaude.vue'

const { welcome } = useI18n()
const identity = useCollabIdentity()
const name = ref(identity.hasChosenName.value ? identity.name.value : '')
const styles = computed(() => welcomeScreen({ step: welcomeStep.value }))

/** The name is the one collaborators see, kept on this computer like the rest. */
function keepName(): void {
  if (name.value.trim()) identity.setName(name.value)
}

function connectAgent(): void {
  keepName()
  closeWelcomeForAIChat()
}

function finish(): void {
  keepName()
  closeWelcome()
}

function showMCP(): void {
  keepName()
  welcomeStep.value = 'claude'
}

function onOpenChange(open: boolean): void {
  if (!open) finish()
}
</script>

<template>
  <DialogRoot :open="welcomeOpen" @update:open="onOpenChange">
    <DialogPortal>
      <DialogContent :class="styles.root()" data-test-id="welcome">
        <AppBackdrop drift lights="home" />
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
          v-if="welcomeStep === 'start'"
          :class="styles.column()"
          @submit.prevent="connectAgent"
        >
          <BrandMark variant="app-icon" decorative :class="styles.mark()" />
          <DialogTitle :class="styles.title()">{{ welcome.title }}</DialogTitle>
          <DialogDescription :class="styles.intro()">{{ welcome.intro }}</DialogDescription>

          <div :class="styles.field()">
            <div :class="styles.labelRow()">
              <label for="welcome-name" :class="styles.label()">{{ welcome.nameLabel }}</label>
              <Tip :label="welcome.nameHint" side="right">
                <button type="button" :aria-label="welcome.nameHint" :class="styles.info()">
                  <icon-hugeicons-information-circle class="size-3.5" />
                </button>
              </Tip>
            </div>
            <input
              id="welcome-name"
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

          <div :class="styles.actions()">
            <div :class="styles.buttons()">
              <AppButton
                type="submit"
                size="lg"
                color="primary"
                variant="solid"
                :class="styles.primary()"
                data-test-id="welcome-continue"
              >
                <template #leading><icon-hugeicons-bot class="size-4" /></template>
                {{ welcome.connectAgent }}
              </AppButton>
              <AppButton
                size="lg"
                variant="outline"
                :class="styles.secondary()"
                data-test-id="welcome-mcp"
                @click="showMCP"
              >
                <template #leading><icon-hugeicons-plug class="size-4" /></template>
                {{ welcome.connectMCP }}
              </AppButton>
            </div>
            <p :class="styles.hint()">{{ welcome.connectAgentHint }}</p>
          </div>
        </form>

        <div v-else :class="styles.column()">
          <DialogTitle :class="styles.title()">{{ welcome.claudeTitle }}</DialogTitle>
          <DialogDescription :class="styles.intro()">{{ welcome.claudeIntro }}</DialogDescription>
          <WelcomeStepClaude class="mt-4" />
          <footer :class="styles.footer()">
            <AppButton size="lg" variant="link" @click="welcomeStep = 'start'">
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
