<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { compact } from 'es-toolkit'
import { computed, ref, watch } from 'vue'

import type { AgentAnswer, AgentAnswerImage, AgentQuestionImage } from '@kalka/core/figma-api'
import { useI18n } from '@kalka/vue'

import { pictureAnswer, readAnswerPicture, readPickedPicture } from '@/app/ai/questions/picture'
import { answerQuestions, currentQuestions, skipQuestions } from '@/app/ai/questions/queue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import { chatQuestionsTheme } from '@/theme/chat/questions'

const { ai } = useI18n()

const step = ref(0)
const picks = ref<string[][]>([])
const typed = ref<string[]>([])
const pickedImages = ref<string[][]>([])
const ownPictures = ref<(AgentAnswerImage | null)[]>([])
const brokenImages = ref<string[]>([])
const pictureFailed = ref(false)
const sending = ref(false)
const ui = chatQuestionsTheme()

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

const pickedCount = computed(() => pickedImages.value[step.value]?.length ?? 0)

function segmentState(index: number): 'done' | 'current' | 'todo' {
  if (index < step.value) return 'done'
  return index === step.value ? 'current' : 'todo'
}

function pickedPicturesOf(index: number): AgentQuestionImage[] {
  const asked = questions.value[index]
  return (asked?.images ?? []).filter((image) => pickedImages.value[index]?.includes(image.url))
}

function answerOf(index: number): string {
  const pickedPictures = pickedPicturesOf(index).map(pictureAnswer)
  return [...(picks.value[index] ?? []), ...pickedPictures, typed.value[index]?.trim() ?? '']
    .filter((part) => part.length > 0)
    .join(', ')
}

// The picked references go with the answer as pictures, so the agent sees them, not only their names.
async function answerOfQuestion(index: number): Promise<AgentAnswer> {
  const asked = questions.value[index]
  const answer: AgentAnswer = {
    question: asked?.question ?? '',
    answer: answerOf(index)
  }
  const image = ownPictures.value[index]
  if (image) answer.image = image
  const references = compact(await Promise.all(pickedPicturesOf(index).map(readPickedPicture)))
  if (references.length > 0) answer.references = references
  return answer
}

async function next(): Promise<void> {
  if (!isLast.value) {
    step.value += 1
    return
  }
  const pending = currentQuestions.value
  sending.value = true
  try {
    const answers = await Promise.all(questions.value.map((_, index) => answerOfQuestion(index)))
    // The person may have skipped while the pictures downloaded.
    if (currentQuestions.value === pending) answerQuestions(answers)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section v-if="question" :class="ui.root()" data-test-id="agent-questions" :aria-label="heading">
    <header :class="ui.header()">
      <span :class="ui.heading()">{{ heading }}</span>
      <span v-if="questions.length > 1" :class="ui.count()">
        {{ ai.questionStepShort({ current: step + 1, total: questions.length }) }}
      </span>
    </header>
    <div v-if="questions.length > 1" :class="ui.progress()" aria-hidden="true">
      <span
        v-for="(_, index) in questions"
        :key="index"
        :class="ui.segment()"
        :data-state="segmentState(index)"
      />
    </div>
    <p :class="ui.question()">{{ question.question }}</p>
    <div v-if="question.options?.length" :class="ui.chips()" role="group">
      <button
        v-for="option in question.options"
        :key="option"
        type="button"
        :class="ui.chip()"
        :aria-pressed="isPicked(option)"
        :data-state="isPicked(option) ? 'on' : 'off'"
        data-test-id="agent-question-option"
        @click="pick(option)"
      >
        <icon-hugeicons-tick-02
          v-if="isPicked(option)"
          :class="ui.chipCheck()"
          aria-hidden="true"
        />
        {{ option }}
      </button>
    </div>
    <template v-if="question.images?.length">
      <p :class="ui.hint()">{{ ai.referencesLook }}</p>
      <div :class="ui.tiles()" role="group" data-test-id="agent-question-images">
        <button
          v-for="image in images"
          :key="image.url"
          type="button"
          :aria-pressed="isImagePicked(image)"
          :aria-label="image.label"
          :class="ui.tile()"
          :data-state="isImagePicked(image) ? 'on' : 'off'"
          data-test-id="agent-question-image"
          @click="pickImage(image)"
        >
          <img
            :src="image.url"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            :class="ui.tileImage()"
            @error="brokenImages = [...brokenImages, image.url]"
          />
          <span v-if="isImagePicked(image)" :class="ui.tileBadge()">
            <icon-hugeicons-tick-02 :class="ui.tileBadgeIcon()" aria-hidden="true" />
          </span>
          <span :class="ui.tileName()">{{ image.label }}</span>
          <span :class="ui.tileSource()">{{ image.credit || '\u00A0' }}</span>
        </button>
      </div>
      <div :class="ui.own()">
        <template v-if="ownPicture">
          <img
            :src="`data:${ownPicture.mimeType};base64,${ownPicture.base64}`"
            alt=""
            :class="ui.ownImage()"
          />
          <span :class="ui.ownName()">
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
        <span v-if="pictureFailed" :class="ui.error()" role="alert">
          {{ ai.questionPictureFailed }}
        </span>
      </div>
    </template>
    <AppInput
      v-model="ownAnswer"
      :placeholder="question.placeholder || ai.questionOwnAnswer"
      :aria-label="ai.questionOwnAnswer"
      :ui="{ root: 'h-[30px] w-full min-w-0' }"
      data-test-id="agent-question-own-answer"
      @keydown.enter.prevent="sending || next()"
    />
    <footer :class="ui.footer()">
      <AppButton
        size="xs"
        variant="ghost"
        data-test-id="agent-questions-skip"
        @click="skipQuestions"
      >
        {{ ai.questionSkip }}
      </AppButton>
      <span v-if="pickedCount > 0" :class="ui.picked()">
        {{ ai.referencesPicked({ count: pickedCount }) }}
      </span>
      <div :class="ui.actions()">
        <AppButton v-if="step > 0" size="xs" variant="ghost" @click="step -= 1">
          {{ ai.questionBack }}
        </AppButton>
        <AppButton
          size="xs"
          color="primary"
          variant="solid"
          :loading="sending"
          data-test-id="agent-questions-next"
          @click="next"
        >
          {{ isLast ? ai.questionSend : ai.questionNext }}
        </AppButton>
      </div>
    </footer>
  </section>
</template>
