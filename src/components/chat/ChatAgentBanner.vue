<script setup lang="ts">
import AgentCreature from '@/components/chat/AgentCreature.vue'
import { chatSkyTheme, type AgentBannerState } from '@/theme/chat/sky'

/** The agent in the chat's sky: its creature in a glass tile, its name, and what it is doing. */
const {
  name,
  color,
  state,
  status,
  others = []
} = defineProps<{
  name: string
  /** The agent's color, as a CSS color. */
  color: string
  state: AgentBannerState
  /** One short line, such as "Composing the hero" or "Waiting for you". */
  status: string
  /** Other agents at work in the document, whose creatures stack beside this one. */
  others?: string[]
}>()

const ui = chatSkyTheme()
</script>

<template>
  <div :class="ui.agent()" data-slot="chat-agent-banner" :data-state="state">
    <span :class="ui.tile()">
      <AgentCreature :seed="name" :class="ui.creature()" :data-state="state" :style="{ color }" />
    </span>
    <span v-for="other in others.slice(0, 3)" :key="other" :class="ui.other()">
      <AgentCreature :seed="other" :class="ui.otherCreature()" :style="{ color }" />
    </span>
    <div :class="ui.text()">
      <span :class="ui.name()">{{ name }}</span>
      <span :class="ui.status()" role="status">
        <span aria-hidden="true" :class="ui.dot()" :data-state="state" />
        <span :class="ui.statusText()">{{ status }}</span>
      </span>
    </div>
    <span v-if="state === 'working'" aria-hidden="true" :class="ui.progress()">
      <span :class="ui.liquid()" />
    </span>
  </div>
</template>
