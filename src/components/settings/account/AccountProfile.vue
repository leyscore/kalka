<script setup lang="ts">
import { ref } from 'vue'

import { useCollabIdentity } from '@/app/collab/identity'
import AccountProfileCard from '@/components/settings/account/AccountProfileCard.vue'

/** The person's card, bound to the one name others see in every shared room. */
const identity = useCollabIdentity()
const draft = ref(identity.hasChosenName.value ? identity.name.value : '')

function save() {
  identity.setName(draft.value)
}
</script>

<template>
  <AccountProfileCard
    v-model="draft"
    :color="identity.color"
    :guest-name="identity.guestName"
    @save="save"
  />
</template>
