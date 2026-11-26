<script setup lang="ts">
import { ref, useId } from 'vue'

import {
  createNodeAction,
  createPrototypeTransition,
  customEasing,
  easingSpring,
  type PrototypeEasingType,
  type PrototypeAction,
  type PrototypeReaction,
  type PrototypeTransition,
  type PrototypeTriggerType
} from '@kalka/scene-graph'
import { usePrototypeMessages } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import PanelItemRow from '@/components/ui/panel/PanelItemRow.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import AppCheckbox from '@/components/ui/toggle/AppCheckbox.vue'

import EasingEditor from './EasingEditor.vue'
import {
  actionOptions,
  animationOptions,
  directionOptions,
  DIRECTIONAL,
  easingOptions,
  triggerOptions,
  type ActionKind,
  type AnimationKind
} from './options'

/**
 * One interaction, as Figma's interaction editor shows it: the trigger, then each action with
 * its destination and animation. Every change replaces the whole interaction.
 */
const { reaction, destinations } = defineProps<{
  reaction: PrototypeReaction
  /** Layers each kind of action can go to, as options. */
  destinations: (kind: ActionKind) => { value: string; label: string }[]
}>()
const emit = defineEmits<{ update: [reaction: PrototypeReaction]; remove: [] }>()
const m = usePrototypeMessages()
const newTabId = useId()
const matchId = useId()
const preserveId = useId()

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

function kindOf(action: PrototypeAction): ActionKind {
  return action.type === 'NODE' ? action.navigation : action.type
}

function setKind(index: number, kind: ActionKind) {
  const current = reaction.actions[index]
  if (kind === 'BACK' || kind === 'CLOSE') return setAction(index, { type: kind })
  if (kind === 'URL') return setAction(index, { type: 'URL', url: '', openInNewTab: true })
  const node = createNodeAction(null, kind)
  if (current.type === 'NODE') node.transition = current.transition
  // Change to and scroll to need a destination of their own kind.
  const keep =
    current.type === 'NODE' &&
    destinations(kind).some((option) => option.value === current.destinationId)
  node.destinationId = keep && current.type === 'NODE' ? current.destinationId : null
  setAction(index, node)
}

/** The link being typed, set on change so typing is one undo step. */
const urlDraft = ref<string | null>(null)

function commitURL(index: number) {
  const action = reaction.actions[index]
  if (action.type === 'URL' && urlDraft.value !== null)
    setAction(index, { ...action, url: urlDraft.value.trim() })
  urlDraft.value = null
}

function animationOf(action: PrototypeAction): AnimationKind {
  return action.type === 'NODE' && action.transition ? action.transition.type : 'INSTANT'
}

function setTransition(
  index: number,
  change: (transition: PrototypeTransition) => PrototypeTransition
) {
  const action = reaction.actions[index]
  if (action.type !== 'NODE' || !action.transition) return
  setAction(index, { ...action, transition: change(action.transition) })
}

/** Custom bezier and custom spring start from the easing chosen before, as in Figma. */
function setEasing(index: number, type: PrototypeEasingType) {
  setTransition(index, (t) => ({
    ...t,
    easing:
      type === 'CUSTOM_CUBIC_BEZIER' || type === 'CUSTOM_SPRING'
        ? customEasing(t.easing, type)
        : { type, bezier: null, spring: null }
  }))
}

function setAnimation(index: number, kind: AnimationKind) {
  const action = reaction.actions[index]
  if (action.type !== 'NODE') return
  if (kind === 'INSTANT') return setAction(index, { ...action, transition: null })
  const transition = action.transition
    ? { ...action.transition, type: kind }
    : createPrototypeTransition(kind)
  setAction(index, { ...action, transition })
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

    <div v-for="(action, index) in reaction.actions" :key="index" class="flex flex-col gap-1">
      <AppSelect
        :model-value="kindOf(action)"
        :options="actionOptions(m)"
        :label="m.action"
        data-property="prototype-action"
        @update:model-value="setKind(index, $event)"
      />
      <template v-if="action.type === 'URL'">
        <AppInput
          size="sm"
          type="url"
          :aria-label="m.url"
          placeholder="https://"
          :model-value="urlDraft ?? action.url"
          data-property="prototype-url"
          @update:model-value="urlDraft = String($event)"
          @change="commitURL(index)"
        />
        <label class="flex cursor-pointer items-center gap-2 py-1 text-[11px] text-muted">
          <AppCheckbox
            :model-value="action.openInNewTab"
            :ariaLabelledby="newTabId"
            @update:model-value="setAction(index, { ...action, openInNewTab: $event === true })"
          />
          <span :id="newTabId">{{ m.openInNewTab }}</span>
        </label>
      </template>
      <template v-else-if="action.type === 'NODE'">
        <AppSelect
          :model-value="action.destinationId ?? ''"
          :options="destinations(action.navigation)"
          :placeholder="m.none"
          :label="m.destination"
          data-property="prototype-destination"
          @update:model-value="setAction(index, { ...action, destinationId: $event || null })"
        />
        <label
          v-if="action.navigation === 'NAVIGATE'"
          class="flex cursor-pointer items-center gap-2 py-1 text-[11px] text-muted"
        >
          <AppCheckbox
            :model-value="action.preserveScrollPosition"
            :ariaLabelledby="preserveId"
            @update:model-value="
              setAction(index, { ...action, preserveScrollPosition: $event === true })
            "
          />
          <span :id="preserveId">{{ m.preserveScroll }}</span>
        </label>
        <AppSelect
          :model-value="animationOf(action)"
          :options="animationOptions(m)"
          :label="m.animation"
          data-property="prototype-animation"
          @update:model-value="setAnimation(index, $event)"
        />
        <template v-if="action.transition">
          <AppSelect
            v-if="DIRECTIONAL.has(action.transition.type)"
            :model-value="action.transition.direction"
            :options="directionOptions(m)"
            :label="m.direction"
            data-property="prototype-direction"
            @update:model-value="(direction) => setTransition(index, (t) => ({ ...t, direction }))"
          />
          <label
            v-if="DIRECTIONAL.has(action.transition.type)"
            class="flex cursor-pointer items-center gap-2 py-1 text-[11px] text-muted"
          >
            <AppCheckbox
              :model-value="action.transition.matchLayers"
              :ariaLabelledby="matchId"
              @update:model-value="
                (on) => setTransition(index, (t) => ({ ...t, matchLayers: on === true }))
              "
            />
            <span :id="matchId">{{ m.matchLayers }}</span>
          </label>
          <PanelItemRow>
            <AppSelect
              :model-value="action.transition.easing.type"
              :options="easingOptions(m)"
              :label="m.easing"
              :ui="{ trigger: 'w-auto flex-1' }"
              data-property="prototype-easing"
              @update:model-value="(type) => setEasing(index, type)"
            />
            <div v-if="!easingSpring(action.transition.easing)" class="w-20 shrink-0">
              <NumberField
                :aria-label="m.duration"
                suffix="ms"
                :min="1"
                :step="50"
                data-property="prototype-duration"
                :model-value="Math.round(action.transition.duration * 1000)"
                @commit="
                  (value: number) =>
                    setTransition(index, (t) => ({ ...t, duration: Math.max(1, value) / 1000 }))
                "
              />
            </div>
          </PanelItemRow>
          <EasingEditor
            v-if="
              action.transition.easing.type === 'CUSTOM_CUBIC_BEZIER' ||
              action.transition.easing.type === 'CUSTOM_SPRING'
            "
            :easing="action.transition.easing"
            @update="(easing) => setTransition(index, (t) => ({ ...t, easing }))"
          />
        </template>
      </template>
    </div>
  </div>
</template>
