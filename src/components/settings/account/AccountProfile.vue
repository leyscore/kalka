<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { ref } from 'vue'

import { useCollaborationMessages } from '@kalka/vue'

import { useAvatar } from '@/app/collab/avatar'
import { useCollabIdentity } from '@/app/collab/identity'
import AccountProfileCard from '@/components/settings/account/AccountProfileCard.vue'

/**
 * The person's card, bound to the one name others see in every shared room and to their picture
 * on this device: a photo they pick, or their pixel creature.
 */
const messages = useCollaborationMessages()
const identity = useCollabIdentity()
const avatar = useAvatar()
const draft = ref(identity.hasChosenName.value ? identity.name.value : '')
const error = ref('')
const dialog = useFileDialog({ accept: 'image/*', multiple: false, reset: true })

dialog.onChange((files) => {
  const file = files?.[0]
  if (!file) return
  error.value = ''
  avatar.choosePhoto(file).catch(() => {
    error.value = messages.value.photoUnreadable
  })
})

function save() {
  identity.setName(draft.value)
}

function shuffle() {
  error.value = ''
  avatar.shuffle()
}
</script>

<template>
  <AccountProfileCard
    v-model="draft"
    :color="identity.color"
    :guest-name="identity.guestName"
    :image="avatar.url.value"
    :has-photo="avatar.hasPhoto.value"
    :error="error"
    @save="save"
    @pick="dialog.open()"
    @shuffle="shuffle"
    @remove="avatar.removePhoto"
  />
</template>
