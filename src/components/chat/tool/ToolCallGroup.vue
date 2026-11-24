<script setup lang="ts">
import { compact } from 'es-toolkit'
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import { computed } from 'vue'

import { useI18n } from '@kalka/vue'

import { toolDisplayName, toolSummary, type ToolCallPart } from '@/app/ai/chat/tool-calls/display'
import { plannedSections, toolSteps, type ToolPhase } from '@/app/ai/chat/tool-calls/phase'
import { toolCallState, type ToolDisplayState } from '@/components/chat/tool/state'
import ToolCallCard from '@/components/chat/tool/ToolCallCard.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import { chatToolTheme } from '@/theme/chat/tool'
import { collapsibleContentMotion } from '@/theme/collapsible/collapsible'

/** `undone`: the calls whose edit the user undid. */
const { parts, undone } = defineProps<{ parts: ToolCallPart[]; undone?: ReadonlySet<string> }>()
const { ai } = useI18n()
const ui = chatToolTheme()

/** A bar's height for a section's: a hero reads taller than a footer, within a small strip. */
const BAR = { min: 8, max: 24, perPixel: 1 / 34 }

/** The sections the agent announced, as small bars: filled once built, dashed until then. */
const sections = computed(() =>
  plannedSections(parts)?.map((section, index) => ({
    key: `${index}:${section.name}`,
    name: section.name,
    state: section.done ? 'done' : 'todo',
    height: `${Math.round(Math.min(BAR.max, Math.max(BAR.min, section.height * BAR.perPixel)))}px`
  }))
)

const phaseNames = computed<Record<ToolPhase, string>>(() => ({
  ask: ai.value.stepAsk,
  references: ai.value.stepReferences,
  style: ai.value.stepStyle,
  check: ai.value.stepCheck,
  read: ai.value.stepRead,
  build: ai.value.stepBuild
}))

/**
 * A run of calls reads as a constellation: one star for each step of the work, named for what the
 * step is for. A step says what the agent is doing while it works and how much it did once it
 * rests; its calls open on a click.
 */
const steps = computed(() => {
  const cut = toolSteps(parts)
  const lastBuild = cut.findLastIndex((step) => step.phase === 'build')
  return cut.map((step, index) => {
    const latest = step.parts.at(-1)
    const failed = step.parts.filter((part) => toolCallState(part) === 'error').length
    let state: ToolDisplayState = 'done'
    if (latest && toolCallState(latest) === 'pending') state = 'pending'
    else if (failed === step.parts.length) state = 'error'
    const count = ai.value.toolActions({ count: step.parts.length })
    let summary = count
    if (latest && (state === 'pending' || step.parts.length === 1)) {
      summary = compact([toolDisplayName(latest), toolSummary(latest)]).join(' ')
    }
    return {
      key: step.parts[0]?.toolCallId ?? step.phase,
      name: phaseNames.value[step.phase],
      state,
      summary,
      // One failed call among several is still worth a glance; a step that failed whole says so with its star.
      failed: failed && state === 'done' ? ai.value.toolStepsFailed({ count: failed }) : '',
      parts: step.parts,
      // What the page will be made of sits under the step that builds it now.
      sections: index === lastBuild ? sections.value : null,
      // A step whose every edit the user undid reads as undone, like its calls.
      undone: step.parts.every((part) => undone?.has(part.toolCallId)),
      someUndone: step.parts.some((part) => undone?.has(part.toolCallId))
    }
  })
})
const stateLabels = computed<Record<ToolDisplayState, string>>(() => ({
  pending: ai.value.toolRunning,
  done: ai.value.toolFinished,
  error: ai.value.toolError
}))
</script>

<template>
  <div :class="ui.steps()" data-slot="chat-tool-group">
    <CollapsibleRoot
      v-for="step in steps"
      :key="step.key"
      :class="ui.step()"
      :data-step="step.state"
      :data-undone="step.undone"
      data-slot="chat-tool-step"
    >
      <span :class="ui.stepRail()">
        <span aria-hidden="true" :class="ui.stepLine()" />
        <span v-if="step.state === 'pending'" aria-hidden="true" :class="ui.stepGlow()" />
        <span
          :class="ui.stepStar()"
          :data-state="step.state"
          :aria-label="stateLabels[step.state]"
          role="img"
        />
      </span>
      <div :class="ui.stepBody()">
        <CollapsibleTrigger :class="ui.stepTrigger()">
          <span :class="ui.stepName()">{{ step.name }}</span>
          <span :class="ui.stepSummary()">{{ step.summary }}</span>
          <span v-if="step.failed" :class="ui.stepFailed()">{{ step.failed }}</span>
          <span v-if="step.someUndone" :class="ui.undone()" data-slot="chat-tool-undone">
            <icon-hugeicons-undo-02 :class="ui.undoneIcon()" aria-hidden="true" />
            {{ ai.toolUndone }}
          </span>
        </CollapsibleTrigger>
        <ul
          v-if="step.sections"
          :class="ui.stepSections()"
          :aria-label="ai.stepSections"
          data-slot="chat-tool-sections"
        >
          <li v-for="section in step.sections" :key="section.key">
            <Tip :label="section.name">
              <span
                :class="ui.stepSection()"
                :data-state="section.state"
                :style="{ height: section.height }"
                role="img"
                :aria-label="
                  section.state === 'done'
                    ? ai.stepSectionBuilt({ name: section.name })
                    : ai.stepSectionPlanned({ name: section.name })
                "
              />
            </Tip>
          </li>
        </ul>
        <CollapsibleContent :class="collapsibleContentMotion">
          <div :class="ui.groupItems()">
            <ToolCallCard
              v-for="part in step.parts"
              :key="part.toolCallId"
              :part="part"
              :undone="undone?.has(part.toolCallId)"
            />
          </div>
        </CollapsibleContent>
      </div>
    </CollapsibleRoot>
  </div>
</template>
