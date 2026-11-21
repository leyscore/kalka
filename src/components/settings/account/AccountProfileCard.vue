<script setup lang="ts">
import { computed } from 'vue'

import type { Color } from '@kalka/scene-graph/primitives'
import { useCollaborationMessages } from '@kalka/vue'

import { avatarColors } from '@/components/shell/sidebar'
import AppInput from '@/components/ui/input/AppInput.vue'
import { accountProfile } from '@/theme/settings/account'

/**
 * The person in Settings › Account: their picture (a pixel creature in their color until they
 * choose a photo), the name teammates see, and a preview of their cursor with that name and
 * picture, as it moves in a shared room. Until they choose a name the preview shows the generated
 * one they join with.
 */
const { color, guestName, image, hasPhoto, error } = defineProps<{
  /** The color their cursor and avatar take in rooms. */
  color: Color
  /** The generated name rooms use while the name is empty, such as "Teal Fox". */
  guestName: string
  /** Their picture's address: the photo they chose or their pixel creature. */
  image: string
  hasPhoto: boolean
  /** Why the last photo could not be used, shown under the actions. */
  error?: string
}>()
const name = defineModel<string>({ required: true })
const emit = defineEmits<{ save: []; pick: []; shuffle: []; remove: [] }>()

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
      <button
        type="button"
        :class="ui.avatar()"
        :aria-label="messages.changePhoto"
        data-test-id="settings-avatar"
        @click="emit('pick')"
      >
        <img :src="image" alt="" :class="ui.avatarImage()" />
        <span :class="ui.avatarHover()" aria-hidden="true">
          <icon-hugeicons-camera-01 class="size-5" />
        </span>
      </button>
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
        <div :class="ui.actions()">
          <button type="button" :class="ui.action()" @click="emit('pick')">
            <icon-hugeicons-image-upload class="size-3.5" aria-hidden="true" />
            {{ messages.changePhoto }}
          </button>
          <button
            type="button"
            :class="ui.action()"
            data-test-id="settings-avatar-shuffle"
            @click="emit('shuffle')"
          >
            <icon-hugeicons-dice class="size-3.5" aria-hidden="true" />
            {{ messages.newPixelAvatar }}
          </button>
          <button v-if="hasPhoto" type="button" :class="ui.action()" @click="emit('remove')">
            <icon-hugeicons-delete-02 class="size-3.5" aria-hidden="true" />
            {{ messages.removePhoto }}
          </button>
        </div>
        <p v-if="error" :class="ui.error()" role="alert">{{ error }}</p>
      </div>
    </div>
    <div :class="ui.preview()" aria-hidden="true">
      <span :class="ui.previewLabel()">{{ messages.namePreview }}</span>
      <div :class="ui.cursor()">
        <span :class="ui.pointer()">
          <span :class="ui.pointerEdge()" />
          <span :class="ui.pointerFill()" :style="{ backgroundColor: fill }" />
        </span>
        <span :class="ui.tag()" :style="{ backgroundColor: fill, color: ink }">
          <img :src="image" alt="" :class="ui.tagImage()" />
          <span class="truncate">{{ shown }}</span>
        </span>
      </div>
    </div>
  </section>
</template>
