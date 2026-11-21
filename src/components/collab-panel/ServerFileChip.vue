<script setup lang="ts">
import { computed } from 'vue'

import { useCollaborationMessages } from '@kalka/vue'

import Tip from '@/components/ui/overlay/Tip.vue'
import { serverFileChip } from '@/theme/collaboration/server-file-chip'

/**
 * Says, beside the document's name, that the file lives on a Kalka server, so a server file
 * reads apart from a local one; for a viewer it says the file is view only.
 */
const { serverName, viewOnly = false } = defineProps<{
  serverName: string
  viewOnly?: boolean
}>()

const messages = useCollaborationMessages()
const ui = computed(() => serverFileChip({ viewOnly }))
const tip = computed(() =>
  viewOnly ? messages.value.serverViewOnly : messages.value.serverRoomSaved({ server: serverName })
)
</script>

<template>
  <Tip :label="tip" side="bottom">
    <span
      :class="ui.root()"
      role="status"
      :data-view-only="viewOnly || undefined"
      data-test-id="server-file-chip"
    >
      <icon-hugeicons-view v-if="viewOnly" :class="ui.icon()" aria-hidden="true" />
      <icon-hugeicons-server-stack-01 v-else :class="ui.icon()" aria-hidden="true" />
      <span :class="ui.label()">
        {{ viewOnly ? messages.serverViewOnlyBadge : serverName }}
      </span>
    </span>
  </Tip>
</template>
