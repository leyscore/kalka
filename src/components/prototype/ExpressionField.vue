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
import AppSelect from '@/components/ui/select/AppSelect.vue'

/**
 * A value or a condition typed as Figma's expression field takes it: `count + 1`,
 * `"Hi " + name`, `count >= 3 and not done`. Variables go by name (`{name}` for any name), and
 * `accent[Dark]` reads one in a mode of its collection; what does not parse stays in the field
 * with why, and is set only once it parses.
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
const collections = useSceneComputed(() => [...store.graph.variableCollections.values()])

/** The modes of a variable's collection. */
function modesOf(variableId: string) {
  const variable = variables.value.find((candidate) => candidate.id === variableId)
  return (
    collections.value.find((collection) => collection.id === variable?.collectionId)?.modes ?? []
  )
}

function format(value: PrototypeExpression): string {
  return formatPrototypeExpression(
    value,
    (id) => variables.value.find((variable) => variable.id === id)?.name ?? id,
    (id, modeId) => modesOf(id).find((mode) => mode.modeId === modeId)?.name ?? modeId
  )
}

const text = computed(() => (expression ? format(expression) : ''))

/**
 * Variables of collections with more than one mode, each in each mode, as Figma's expression
 * field offers them: choosing one adds `name[Mode]` to the expression, which reads the variable
 * in that mode whatever mode the prototype shows.
 */
const modeLookups = computed(() =>
  variables.value.flatMap((variable) => {
    const modes = modesOf(variable.id)
    if (modes.length < 2) return []
    return modes.map((mode) => {
      const label = format({ type: 'VARIABLE', variableId: variable.id, modeId: mode.modeId })
      return { value: label, label }
    })
  })
)

function insertModeLookup(token: string) {
  const current = (draft.value ?? text.value).trim()
  draft.value = current ? `${current} ${token}` : token
  commit()
}

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
    (name) => variables.value.find((variable) => variable.name === name)?.id,
    (id, name) => modesOf(id).find((mode) => mode.name === name)?.modeId
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
    <AppSelect
      v-if="modeLookups.length > 0"
      model-value=""
      :options="modeLookups"
      :label="m.insertModeLookup"
      :placeholder="m.insertModeLookup"
      data-property="prototype-mode-lookup"
      @update:model-value="insertModeLookup"
    />
    <p v-if="error" role="alert" class="text-[11px] text-error">{{ error }}</p>
  </div>
</template>
