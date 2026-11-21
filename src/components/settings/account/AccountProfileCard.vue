<script setup lang="ts">
import { computed } from 'vue'

import type { Color } from '@kalka/scene-graph/primitives'
import { useCollaborationMessages } from '@kalka/vue'

import { avatarColors, initialsOf } from '@/components/shell/sidebar'
import AppInput from '@/components/ui/input/AppInput.vue'
import { accountProfile } from '@/theme/settings/account'

/**
 * The person in Settings › Account: their avatar in their color, the name teammates see, and a
 * preview of their cursor with that name, as it moves in a shared room. Until they choose a name
 * the preview shows the generated one they join with.
 */
const { color, guestName } = defineProps<{
  /** The color their cursor and avatar take in rooms. */
  color: Color
  /** The generated name rooms use while the name is empty, such as "Teal Fox". */
  guestName: string
}>()
const name = defineModel<string>({ required: true })
const emit = defineEmits<{ save: [] }>()

const messages = useCollaborationMessages()
const ui = accountProfile()
const shown = computed(() => name.value.trim() || guestName)
const colors = computed(() => avatarColors(color))
const fill = computed(() => colors.value.fill)
const ink = computed(() => colors.value.ink)
</script>

<template>
  <section :class="ui.root()" data-test-id="settings-account-profile">
    <div :class="ui.person()">
      <span
        :class="ui.avatar()"
        :style="{ backgroundColor: fill, color: ink }"
        aria-hidden="true"
        >{{ initialsOf(shown) }}</span
      >
      <div :class="ui.fields()">
        <label for="settings-collab-name" :class="ui.label()">{{
          messages.nameSettingTitle
        }}</label>
        <AppInput
          id="settings-collab-name"
          v-model="name"
          data-test-id="settings-collab-name"
          class="w-full"
          :placeholder="guestName"
          @change="emit('save')"
          @enter="emit('save')"
        />
        <p :class="ui.hint()">{{ messages.nameSettingDescription }}</p>
      </div>
    </div>
    <div :class="ui.preview()" aria-hidden="true">
      <span :class="ui.previewLabel()">{{ messages.namePreview }}</span>
      <div :class="ui.cursor()">
        <span :class="ui.pointer()">
          <span :class="ui.pointerEdge()" />
          <span :class="ui.pointerFill()" :style="{ backgroundColor: fill }" />
        </span>
        <span :class="ui.tag()" :style="{ backgroundColor: fill, color: ink }">{{ shown }}</span>
      </div>
    </div>
  </section>
</template>
