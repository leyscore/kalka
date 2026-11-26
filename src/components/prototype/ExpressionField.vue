<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  formatPrototypeExpression,
  parsePrototypeExpression,
  type PrototypeExpression
} from '@kalka/scene-graph'
import { usePrototypeMessages, useSceneComputed } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import AppInput from '@/components/ui/input/AppInput.vue'

/**
 * A value or a condition typed as Figma's expression field takes it: `count + 1`,
 * `"Hi " + name`, `count >= 3 and not done`. Variables go by name (`{name}` for any name); what
 * does not parse stays in the field with why, and is set only once it parses.
 */
const { expression, label, placeholder } = defineProps<{
  expression: PrototypeExpression | null
  label: string
  placeholder: string
}>()
const emit = defineEmits<{ update: [expression: PrototypeExpression] }>()
const store = useEditorStore()
const m = usePrototypeMessages()

const variables = useSceneComputed(() => [...store.graph.variables.values()])
const text = computed(() =>
  expression
    ? formatPrototypeExpression(
        expression,
        (id) => variables.value.find((variable) => variable.id === id)?.name ?? id
      )
    : ''
)

const draft = ref<string | null>(null)
const error = ref<string | null>(null)

function commit() {
  if (draft.value === null) return
  const typed = draft.value.trim()
  if (typed === '' || typed === text.value) {
    draft.value = null
    error.value = null
    return
  }
  const result = parsePrototypeExpression(
    typed,
    (name) => variables.value.find((variable) => variable.name === name)?.id
  )
  if ('expression' in result) {
    draft.value = null
    error.value = null
    emit('update', result.expression)
    return
  }
  error.value =
    result.error === 'unknown'
      ? m.value.expressionUnknown({ name: result.name })
      : m.value.expressionSyntax
}
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <AppInput
      size="sm"
      :aria-label="label"
      :placeholder="placeholder"
      :model-value="draft ?? text"
      :aria-invalid="error ? 'true' : undefined"
      data-property="prototype-expression"
      @update:model-value="draft = String($event)"
      @change="commit"
    />
    <p v-if="error" role="alert" class="text-[11px] text-error">{{ error }}</p>
  </div>
</template>
