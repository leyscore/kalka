<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useI18n } from '@kalka/vue'

import { answerQuestions, currentQuestions, skipQuestions } from '@/app/ai/questions/queue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'

const { ai } = useI18n()

const step = ref(0)
const picks = ref<string[][]>([])
const typed = ref<string[]>([])

// A new set of questions starts from its first one, with nothing picked.
watch(
  currentQuestions,
  (pending) => {
    step.value = 0
    picks.value = pending?.questions.map(() => []) ?? []
    typed.value = pending?.questions.map(() => '') ?? []
  },
  { immediate: true }
)

const questions = computed(() => currentQuestions.value?.questions ?? [])
const question = computed(() => questions.value[step.value] ?? null)
const isLast = computed(() => step.value === questions.value.length - 1)
const heading = computed(() => {
  const agent = currentQuestions.value?.agent
  return agent ? ai.value.questionsFrom({ agent }) : ai.value.questionsFromAgent
})
const ownAnswer = computed({
  get: () => typed.value[step.value] ?? '',
  set: (text: string) => {
    typed.value = typed.value.map((value, index) => (index === step.value ? text : value))
  }
})

function isPicked(option: string): boolean {
  return picks.value[step.value]?.includes(option) ?? false
}

function pick(option: string): void {
  const current = picks.value[step.value] ?? []
  let next = [option]
  if (question.value?.multiple) {
    next = current.includes(option)
      ? current.filter((value) => value !== option)
      : [...current, option]
  }
  picks.value = picks.value.map((value, index) => (index === step.value ? next : value))
  // One choice answers the question: go on to the next, unless the person typed something too.
  if (!question.value?.multiple && !ownAnswer.value.trim() && !isLast.value) step.value += 1
}

function answerOf(index: number): string {
  return [...(picks.value[index] ?? []), typed.value[index]?.trim() ?? '']
    .filter((part) => part.length > 0)
    .join(', ')
}

function next(): void {
  if (!isLast.value) {
    step.value += 1
    return
  }
  answerQuestions(
    questions.value.map((asked, index) => ({ question: asked.question, answer: answerOf(index) }))
  )
}
</script>

<template>
  <section
    v-if="question"
    class="mx-3 mb-2 flex flex-col gap-3 rounded-lg border border-border bg-panel p-3"
    data-test-id="agent-questions"
    :aria-label="heading"
  >
    <header class="flex items-baseline justify-between gap-2 text-[11px] text-muted">
      <span class="font-semibold">{{ heading }}</span>
      <span v-if="questions.length > 1">
        {{ ai.questionStep({ current: step + 1, total: questions.length }) }}
      </span>
    </header>
    <p class="text-[13px] leading-snug text-surface">{{ question.question }}</p>
    <div v-if="question.options?.length" class="flex flex-wrap gap-1.5" role="group">
      <AppButton
        v-for="option in question.options"
        :key="option"
        size="xs"
        :variant="isPicked(option) ? 'solid' : 'outline'"
        :color="isPicked(option) ? 'primary' : 'neutral'"
        :aria-pressed="isPicked(option)"
        data-test-id="agent-question-option"
        @click="pick(option)"
      >
        {{ option }}
      </AppButton>
    </div>
    <AppInput
      v-model="ownAnswer"
      :placeholder="question.placeholder || ai.questionOwnAnswer"
      :aria-label="ai.questionOwnAnswer"
      data-test-id="agent-question-own-answer"
      @keydown.enter.prevent="next"
    />
    <footer class="flex items-center justify-between gap-2">
      <AppButton
        size="xs"
        variant="ghost"
        data-test-id="agent-questions-skip"
        @click="skipQuestions"
      >
        {{ ai.questionSkip }}
      </AppButton>
      <div class="flex gap-1.5">
        <AppButton v-if="step > 0" size="xs" variant="ghost" @click="step -= 1">
          {{ ai.questionBack }}
        </AppButton>
        <AppButton
          size="xs"
          color="primary"
          variant="solid"
          data-test-id="agent-questions-next"
          @click="next"
        >
          {{ isLast ? ai.questionSend : ai.questionNext }}
        </AppButton>
      </div>
    </footer>
  </section>
</template>
