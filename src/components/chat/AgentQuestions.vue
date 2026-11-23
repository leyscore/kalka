<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import type { AgentAnswerImage, AgentQuestionImage } from '@kalka/core/figma-api'
import { useI18n } from '@kalka/vue'

import { pictureAnswer, readAnswerPicture } from '@/app/ai/questions/picture'
import { answerQuestions, currentQuestions, skipQuestions } from '@/app/ai/questions/queue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'

const { ai } = useI18n()

const step = ref(0)
const picks = ref<string[][]>([])
const typed = ref<string[]>([])
const pickedImages = ref<string[][]>([])
const ownPictures = ref<(AgentAnswerImage | null)[]>([])
const brokenImages = ref<string[]>([])
const pictureFailed = ref(false)

// A new set of questions starts from its first one, with nothing picked.
watch(
  currentQuestions,
  (pending) => {
    step.value = 0
    picks.value = pending?.questions.map(() => []) ?? []
    typed.value = pending?.questions.map(() => '') ?? []
    pickedImages.value = pending?.questions.map(() => []) ?? []
    ownPictures.value = pending?.questions.map(() => null) ?? []
    brokenImages.value = []
    pictureFailed.value = false
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

const images = computed(
  () => question.value?.images?.filter((image) => !brokenImages.value.includes(image.url)) ?? []
)
const ownPicture = computed(() => ownPictures.value[step.value] ?? null)

function isImagePicked(image: AgentQuestionImage): boolean {
  return pickedImages.value[step.value]?.includes(image.url) ?? false
}

// Pictures are compared side by side, so picking one never moves on: several may be liked.
function pickImage(image: AgentQuestionImage): void {
  const current = pickedImages.value[step.value] ?? []
  const next = current.includes(image.url)
    ? current.filter((url) => url !== image.url)
    : [...current, image.url]
  pickedImages.value = pickedImages.value.map((value, index) =>
    index === step.value ? next : value
  )
}

function setOwnPicture(picture: AgentAnswerImage | null): void {
  ownPictures.value = ownPictures.value.map((value, index) =>
    index === step.value ? picture : value
  )
}

const pictureDialog = useFileDialog({
  accept: 'image/png,image/jpeg,image/webp',
  multiple: false,
  reset: true
})
pictureDialog.onChange(async (files) => {
  const file = files?.[0]
  if (!file) return
  pictureFailed.value = false
  try {
    setOwnPicture(await readAnswerPicture(file))
  } catch {
    pictureFailed.value = true
  }
})

function answerOf(index: number): string {
  const asked = questions.value[index]
  const pickedPictures = (asked?.images ?? [])
    .filter((image) => pickedImages.value[index]?.includes(image.url))
    .map(pictureAnswer)
  return [...(picks.value[index] ?? []), ...pickedPictures, typed.value[index]?.trim() ?? '']
    .filter((part) => part.length > 0)
    .join(', ')
}

function next(): void {
  if (!isLast.value) {
    step.value += 1
    return
  }
  answerQuestions(
    questions.value.map((asked, index) => {
      const image = ownPictures.value[index]
      const answer = { question: asked.question, answer: answerOf(index) }
      return image ? { ...answer, image } : answer
    })
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
    <header
      class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11px] text-muted"
    >
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
    <template v-if="question.images?.length">
      <div class="grid grid-cols-2 gap-1.5" role="group" data-test-id="agent-question-images">
        <button
          v-for="image in images"
          :key="image.url"
          type="button"
          :aria-pressed="isImagePicked(image)"
          :aria-label="image.label"
          class="flex min-w-0 flex-col overflow-hidden rounded-md border bg-panel-field text-left transition-colors focus-visible:outline-2 focus-visible:outline-panel-focus"
          :class="
            isImagePicked(image)
              ? 'border-accent ring-2 ring-accent'
              : 'border-border hover:border-muted'
          "
          data-test-id="agent-question-image"
          @click="pickImage(image)"
        >
          <img
            :src="image.url"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            class="aspect-[4/3] w-full bg-canvas object-cover"
            @error="brokenImages = [...brokenImages, image.url]"
          />
          <span class="block truncate px-1.5 pt-1 text-[10px] leading-tight text-surface">
            {{ image.label }}
          </span>
          <span
            v-if="image.credit"
            class="block truncate px-1.5 pb-1 text-[9px] leading-tight text-muted"
          >
            {{ image.credit }}
          </span>
          <span v-else class="pb-1" />
        </button>
      </div>
      <div class="flex min-w-0 flex-wrap items-center gap-1.5">
        <template v-if="ownPicture">
          <img
            :src="`data:${ownPicture.mimeType};base64,${ownPicture.base64}`"
            alt=""
            class="size-8 shrink-0 rounded border border-border object-cover"
          />
          <span class="min-w-0 flex-1 truncate text-[11px] text-surface">
            {{ ai.questionPictureSent({ name: ownPicture.name }) }}
          </span>
          <AppButton size="xs" variant="ghost" @click="setOwnPicture(null)">
            {{ ai.questionRemovePicture }}
          </AppButton>
        </template>
        <AppButton
          v-else
          size="xs"
          variant="outline"
          color="neutral"
          data-test-id="agent-question-own-picture"
          @click="pictureDialog.open()"
        >
          {{ ai.questionOwnPicture }}
        </AppButton>
        <span v-if="pictureFailed" class="text-[11px] text-error" role="alert">
          {{ ai.questionPictureFailed }}
        </span>
      </div>
    </template>
    <AppInput
      v-model="ownAnswer"
      :placeholder="question.placeholder || ai.questionOwnAnswer"
      :aria-label="ai.questionOwnAnswer"
      :ui="{ root: 'w-full min-w-0' }"
      data-test-id="agent-question-own-answer"
      @keydown.enter.prevent="next"
    />
    <footer class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
      <AppButton
        size="xs"
        variant="ghost"
        data-test-id="agent-questions-skip"
        @click="skipQuestions"
      >
        {{ ai.questionSkip }}
      </AppButton>
      <div class="ml-auto flex gap-1.5">
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
