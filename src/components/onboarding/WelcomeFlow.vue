<script setup lang="ts">
import { DialogContent, DialogDescription, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { computed, ref, useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
import {
  closeWelcome,
  closeWelcomeForAIChat,
  welcomeOpen,
  welcomeStep
} from '@/app/onboarding/welcome'
import { DEFAULT_CALLSIGN } from '@/app/presence/callsigns'
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
/** The greeting around the product's name, which is drawn as a selected layer. */
const title = computed(() => {
  const [before = '', ...rest] = welcome.value.title.split('Kalka')
  return { before, after: rest.join('Kalka') }
})
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

/** The name is the first thing to fill in, not the skip link that comes first in the page. */
function focusName(event: Event): void {
  if (!nameInput.value) return
  event.preventDefault()
  nameInput.value.focus()
}

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
          v-if="welcomeStep === 'start'"
          :class="styles.column()"
          @submit.prevent="connectAgent"
        >
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
                  <label for="welcome-name" :class="styles.label()">{{ welcome.nameLabel }}</label>
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
                    <template #leading><icon-hugeicons-ai-magic class="size-4" /></template>
                    {{ welcome.connectAgent }}
                  </AppButton>
                  <AppButton
                    size="lg"
                    variant="outline"
                    :class="styles.secondary()"
                    data-test-id="welcome-mcp"
                    @click="showMCP"
                  >
                    <template #leading><icon-hugeicons-mcp-server class="size-4" /></template>
                    {{ welcome.connectMCP }}
                  </AppButton>
                </div>
                <p :class="styles.hint()">{{ welcome.connectAgentHint }}</p>
              </div>
            </div>
          </div>
        </form>

        <div v-else :class="styles.column()">
          <DialogTitle :class="styles.title()">{{ welcome.claudeTitle }}</DialogTitle>
          <DialogDescription :class="styles.intro()">{{ welcome.claudeIntro }}</DialogDescription>
          <div :class="styles.frame()">
            <div :class="styles.card()"><WelcomeStepClaude /></div>
          </div>
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
