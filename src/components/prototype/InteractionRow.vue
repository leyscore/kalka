<script setup lang="ts">
import {
  createNodeAction,
  type PrototypeAction,
  type PrototypeReaction,
  type PrototypeTriggerType
} from '@kalka/scene-graph'
import { usePrototypeMessages } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import PanelItemRow from '@/components/ui/panel/PanelItemRow.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

import ActionEditor from './ActionEditor.vue'
import { triggerOptions, type ActionKind } from './options'

/**
 * One interaction, as Figma's interaction editor shows it: the trigger, then its actions, run in
 * order, each with its own editor. Every change replaces the whole interaction.
 */
const { reaction, destinations } = defineProps<{
  reaction: PrototypeReaction
  /** Layers each kind of action can go to, as options. */
  destinations: (kind: ActionKind) => { value: string; label: string }[]
}>()
const emit = defineEmits<{ update: [reaction: PrototypeReaction]; remove: [] }>()
const m = usePrototypeMessages()

/** Triggers that wait: After delay, and the mouse triggers' optional delay. */
const DELAYED = new Set<PrototypeTriggerType>([
  'AFTER_TIMEOUT',
  'MOUSE_ENTER',
  'MOUSE_LEAVE',
  'MOUSE_DOWN',
  'MOUSE_UP'
])

function setTrigger(type: PrototypeTriggerType) {
  emit('update', {
    ...reaction,
    trigger: { ...reaction.trigger, type, delay: type === 'AFTER_TIMEOUT' ? 0.8 : 0 }
  })
}

function setDelay(milliseconds: number) {
  emit('update', {
    ...reaction,
    trigger: { ...reaction.trigger, delay: Math.max(0, milliseconds) / 1000 }
  })
}

function recordKey(event: KeyboardEvent) {
  if (event.key === 'Tab') return
  event.preventDefault()
  const modifiers = [
    event.shiftKey ? 16 : null,
    event.ctrlKey ? 17 : null,
    event.altKey ? 18 : null,
    event.metaKey ? 91 : null
  ].filter((code): code is number => code !== null && code !== event.keyCode)
  emit('update', {
    ...reaction,
    trigger: { ...reaction.trigger, keyCodes: [...modifiers, event.keyCode] }
  })
}

function keyLabel(codes: readonly number[]): string {
  const names: Partial<Record<number, string>> = {
    16: 'Shift',
    17: 'Ctrl',
    18: 'Alt',
    91: 'Cmd',
    13: 'Enter',
    27: 'Esc',
    32: 'Space',
    37: '←',
    38: '↑',
    39: '→',
    40: '↓'
  }
  return codes.map((code) => names[code] ?? String.fromCharCode(code)).join('+')
}

function setAction(index: number, action: PrototypeAction) {
  emit('update', {
    ...reaction,
    actions: reaction.actions.map((current, at) => (at === index ? action : current))
  })
}

function removeAction(index: number) {
  emit('update', { ...reaction, actions: reaction.actions.filter((_, at) => at !== index) })
}

/** A new action after the others, as Figma's + in the interaction adds one: Navigate to. */
function addAction() {
  emit('update', { ...reaction, actions: [...reaction.actions, createNodeAction(null)] })
}
</script>

<template>
  <div data-test-id="prototype-interaction" class="flex flex-col gap-1 py-1">
    <PanelItemRow>
      <AppSelect
        :model-value="reaction.trigger.type"
        :options="triggerOptions(m)"
        :label="m.trigger"
        :ui="{ trigger: 'w-auto flex-1' }"
        data-property="prototype-trigger"
        @update:model-value="setTrigger"
      />
      <template #rail="{ removeClass }">
        <IconButton
          :label="m.removeInteraction"
          :class="[removeClass, 'shrink-0']"
          @click="emit('remove')"
        >
          <icon-hugeicons-minus class="size-3.5" />
        </IconButton>
      </template>
    </PanelItemRow>
    <NumberField
      v-if="DELAYED.has(reaction.trigger.type)"
      :aria-label="m.delay"
      suffix="ms"
      :min="0"
      :step="100"
      data-property="prototype-delay"
      :model-value="Math.round(reaction.trigger.delay * 1000)"
      @commit="(value: number) => setDelay(value)"
    />
    <AppInput
      v-if="reaction.trigger.type === 'ON_KEY_DOWN'"
      size="sm"
      readonly
      :aria-label="m.key"
      :placeholder="m.pressKey"
      :model-value="keyLabel(reaction.trigger.keyCodes)"
      data-property="prototype-key"
      @keydown="recordKey"
    />

    <ActionEditor
      v-for="(action, index) in reaction.actions"
      :key="index"
      :action="action"
      :destinations="destinations"
      :removable="reaction.actions.length > 1"
      @update="(next) => setAction(index, next)"
      @remove="removeAction(index)"
    />
    <AppButton size="xs" class="self-start" data-test-id="prototype-add-action" @click="addAction">
      <icon-hugeicons-plus-sign class="size-3" />
      {{ m.addAction }}
    </AppButton>
  </div>
</template>
