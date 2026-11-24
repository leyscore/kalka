<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed } from 'vue'

import { useI18n, vTestId } from '@kalka/vue'

import { WORKFLOW_FOCUSES, type WorkflowFocus } from '@/app/settings/preferences/store'
import { workflowRule } from '@/theme/settings/preferences'

/** The workflow levels as a rule with three notches, from no AI to AI first. */
const focus = defineModel<WorkflowFocus>({ required: true })

const { settings } = useI18n()
const ui = workflowRule()

const stops = computed(() => [
  {
    value: WORKFLOW_FOCUSES[0],
    label: settings.value.workflowFocusDesign,
    struck: true
  },
  {
    value: WORKFLOW_FOCUSES[1],
    label: settings.value.workflowFocusBalanced,
    struck: false
  },
  {
    value: WORKFLOW_FOCUSES[2],
    label: settings.value.workflowFocusAI,
    struck: false
  }
])

const level = computed(() => WORKFLOW_FOCUSES.indexOf(focus.value))

const position = computed<number[]>({
  get: () => [level.value],
  set: ([next]) => {
    const known = next === undefined ? undefined : WORKFLOW_FOCUSES[next]
    if (known) focus.value = known
  }
})
</script>

<template>
  <div :class="ui.root()" data-test-id="settings-workflow-focus">
    <SliderRoot
      v-model="position"
      :min="0"
      :max="WORKFLOW_FOCUSES.length - 1"
      :step="1"
      :class="ui.slider()"
    >
      <SliderTrack :class="ui.track()">
        <SliderRange :class="ui.range()" />
        <span :class="ui.notches()" aria-hidden="true">
          <span
            v-for="(stop, index) in stops"
            :key="stop.value"
            :class="ui.notch()"
            :data-reached="index <= level || undefined"
          />
        </span>
      </SliderTrack>
      <SliderThumb
        :class="ui.thumb()"
        :aria-label="settings.workflowFocus"
        :aria-valuetext="stops[level]?.label"
      />
    </SliderRoot>
    <div :class="ui.stops()">
      <button
        v-for="stop in stops"
        :key="stop.value"
        type="button"
        tabindex="-1"
        :class="ui.stop()"
        :data-active="stop.value === focus || undefined"
        v-test-id="`settings-workflow-focus-${stop.value}`"
        @click="focus = stop.value"
      >
        <span :class="[ui.icon(), stop.struck && ui.strike()]" aria-hidden="true">
          <icon-hugeicons-ai-magic v-if="stop.value === 'ai'" :class="ui.glyph()" />
          <icon-hugeicons-sparkles v-else :class="ui.glyph()" />
        </span>
        {{ stop.label }}
      </button>
    </div>
  </div>
</template>
