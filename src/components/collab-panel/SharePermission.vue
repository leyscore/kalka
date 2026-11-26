<script setup lang="ts">
import { useCollaborationMessages } from '@kalka/vue'

/**
 * Who can change a shared file, said before it is shared and while it is: a live room's link
 * lets anyone edit, and a server file opens with each member's own role.
 */
const { server } = defineProps<{ server?: string }>()
const messages = useCollaborationMessages()
</script>

<template>
  <p
    class="flex items-start gap-1.5 text-[11px] text-muted"
    data-test-id="collab-share-permission"
    :data-permission="server ? 'account-role' : 'edit'"
  >
    <icon-hugeicons-user-group v-if="server" class="mt-px size-3 shrink-0" aria-hidden="true" />
    <icon-hugeicons-pencil-edit-02 v-else class="mt-px size-3 shrink-0" aria-hidden="true" />
    <span>
      {{ server ? messages.sharePermissionServer({ server }) : messages.sharePermissionRoom }}
    </span>
  </p>
</template>
