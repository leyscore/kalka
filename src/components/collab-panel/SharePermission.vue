<script setup lang="ts">
import { computed } from 'vue'

import { useCollaborationMessages } from '@kalka/vue'

import type { ServerLinkRole } from '@/app/collab/server/api'
import AppSelect from '@/components/ui/select/AppSelect.vue'

/**
 * Who can change a shared file, said before it is shared and while it is. On a Kalka server the
 * person who may choose sets whether members with the link edit it or only view it, which the
 * server enforces; a live room's link always lets anyone edit, as it has no access control, and
 * says so.
 */
const {
  server,
  linkRole = 'edit',
  editable = false
} = defineProps<{
  server?: string
  linkRole?: ServerLinkRole
  /** Whether this person may change how the server file is shared. */
  editable?: boolean
}>()
const emit = defineEmits<{ 'update:linkRole': [linkRole: ServerLinkRole] }>()
const messages = useCollaborationMessages()
const options = computed(() => [
  { value: 'edit' as const, label: messages.value.shareLinkCanEdit },
  { value: 'view' as const, label: messages.value.shareLinkCanView }
])

function choose(value: ServerLinkRole) {
  emit('update:linkRole', value)
}
</script>

<template>
  <div
    class="flex flex-col gap-1.5"
    data-test-id="collab-share-permission"
    :data-permission="server ? linkRole : 'edit'"
  >
    <div v-if="server && editable" class="flex items-center justify-between gap-2">
      <span class="text-[11px] text-muted">{{ messages.shareLinkRoleLabel }}</span>
      <AppSelect
        :model-value="linkRole"
        :label="messages.shareLinkRoleLabel"
        :options="options"
        class="w-[132px]"
        data-test-id="collab-share-link-role"
        @update:model-value="choose"
      />
    </div>
    <p class="flex items-start gap-1.5 text-[11px] text-muted">
      <icon-hugeicons-view
        v-if="server && linkRole === 'view'"
        class="mt-px size-3 shrink-0"
        aria-hidden="true"
      />
      <icon-hugeicons-user-group
        v-else-if="server"
        class="mt-px size-3 shrink-0"
        aria-hidden="true"
      />
      <icon-hugeicons-pencil-edit-02 v-else class="mt-px size-3 shrink-0" aria-hidden="true" />
      <span>
        <template v-if="!server">
          {{ messages.sharePermissionRoom }} {{ messages.sharePermissionRoomNoControl }}
        </template>
        <template v-else-if="linkRole === 'view'">
          {{ messages.sharePermissionServerView({ server }) }}
        </template>
        <template v-else>{{ messages.sharePermissionServer({ server }) }}</template>
      </span>
    </p>
  </div>
</template>
