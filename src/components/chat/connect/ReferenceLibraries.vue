<script setup lang="ts">
import { useAIMessages, useAutomationMessages, useCommonMessages } from '@kalka/vue'

import type { ReferenceLibrary } from '@/app/integrations/mcp/libraries'
import inspoLogo from '@/assets/libraries/inspo.svg'
import mobbinLogo from '@/assets/libraries/mobbin.svg'
import referoLogo from '@/assets/libraries/refero.png'
import AgentCreature from '@/components/chat/AgentCreature.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import { referenceLibrariesTheme } from '@/theme/chat/libraries'

/**
 * The offer to connect a design-reference library, so the agent shows real websites and screens
 * before it designs. It floats at the bottom right of the window and never blocks the chat.
 */
const { agent, color, libraries } = defineProps<{
  /** The agent's name, as the chat's sky shows it. */
  agent: string
  /** The agent's color, as a CSS color. */
  color: string
  libraries: ReferenceLibrary[]
}>()
const emit = defineEmits<{ connect: [library: ReferenceLibrary]; dismiss: [] }>()

const ai = useAIMessages()
const automation = useAutomationMessages()
const common = useCommonMessages()
const ui = referenceLibrariesTheme()

/** Each library's own mark, as its website publishes it. */
const LOGOS: Record<ReferenceLibrary['key'], string> = {
  inspo: inspoLogo,
  mobbin: mobbinLogo,
  refero: referoLogo
}

function about(library: ReferenceLibrary): string {
  if (library.key === 'mobbin') return ai.value.libraryMobbin
  if (library.key === 'refero') return ai.value.libraryRefero
  return ai.value.libraryInspo
}
</script>

<template>
  <section
    role="dialog"
    :aria-label="ai.librariesLabel"
    :class="ui.root()"
    data-slot="reference-libraries"
  >
    <div :class="ui.sky()">
      <div aria-hidden="true" :class="ui.reach()">
        <span :class="ui.tile()">
          <AgentCreature :seed="agent" :class="ui.creature()" :style="{ color }" />
        </span>
        <span :class="ui.thread()" />
        <span :class="ui.badges()">
          <span
            v-for="library in libraries"
            :key="library.key"
            :class="ui.badge()"
            :data-state="library.state"
            :data-library="library.key"
          >
            <img :src="LOGOS[library.key]" alt="" :class="ui.logo()" />
          </span>
        </span>
      </div>
      <Tip :label="common.close">
        <button
          type="button"
          :class="ui.close()"
          :aria-label="common.close"
          @click="emit('dismiss')"
        >
          <icon-hugeicons-cancel-01 class="size-3.5" aria-hidden="true" />
        </button>
      </Tip>
    </div>
    <div :class="ui.body()">
      <h2 :class="ui.title()">{{ ai.librariesTitle }}</h2>
      <p :class="ui.text()">{{ ai.librariesText({ agent }) }}</p>
      <ul :class="ui.list()">
        <li
          v-for="library in libraries"
          :key="library.key"
          :class="ui.row()"
          :data-state="library.state"
          :data-library="library.key"
        >
          <span :class="ui.rowLogo()" :data-library="library.key" aria-hidden="true">
            <img :src="LOGOS[library.key]" alt="" :class="ui.logo()" />
          </span>
          <div :class="ui.rowBody()">
            <span :class="ui.rowName()">{{ library.name }}</span>
            <span :class="ui.rowHint()">{{ about(library) }}</span>
            <span v-if="library.error" :class="ui.rowError()" role="alert">{{
              library.error
            }}</span>
            <span v-else-if="library.state !== 'connected'" :class="ui.rowHint()">{{
              library.paid ? automation.suggestedPaid : automation.suggestedFree
            }}</span>
          </div>
          <span v-if="library.state === 'connected'" :class="ui.connected()">
            <icon-hugeicons-tick-02 class="size-3.5" aria-hidden="true" />
            {{ ai.libraryConnected }}
          </span>
          <AppButton
            v-else
            size="sm"
            variant="soft"
            :loading="library.state === 'connecting'"
            @click="emit('connect', library)"
          >
            {{ ai.libraryConnect }}
          </AppButton>
        </li>
      </ul>
      <div :class="ui.footer()">
        <span :class="ui.footerText()">{{ ai.librariesFooter({ agent }) }}</span>
        <AppButton size="sm" variant="ghost" @click="emit('dismiss')">
          {{ ai.librariesDismiss }}
        </AppButton>
      </div>
    </div>
  </section>
</template>
