<script setup lang="ts">
import { computed } from 'vue'

import { selectTarget } from '@kalka/vue'

import { useCollabPanelContext } from '@/components/collab-panel/context'
import { roomStatusText } from '@/components/collab-room/statusText'
import { useRoomActions } from '@/components/collab-room/useRoomActions'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import { roomStatus } from '@/theme/collaboration/room-status'

import SharePermission from './SharePermission.vue'

const collab = useCollabPanelContext()
const room = useRoomActions()
const ui = roomStatus()

const statusText = computed(() =>
  roomStatusText(
    collab.messages,
    collab.state.status ?? 'connecting',
    collab.state.peers.length,
    collab.inServerRoom ? (collab.serverName ?? null) : null
  )
)
</script>

<template>
  <p :class="ui.root()" :data-status="collab.state.status" data-test-id="collab-room-status">
    <span :class="ui.dot()" aria-hidden="true" />
    {{ statusText }}
  </p>

  <template v-if="collab.inServerRoom">
    <AppAlert
      v-if="collab.viewOnly"
      tone="warning"
      class="mb-3"
      :heading="collab.messages.serverViewOnlyBadge"
      :description="collab.messages.serverViewOnly"
    />
    <AppButton
      v-if="collab.serverLink"
      color="neutral"
      variant="outline"
      class="mb-3 w-full"
      data-test-id="collab-copy-server-link"
      @click="collab.copyServerLink"
    >
      <template #leading>
        <icon-hugeicons-check v-if="collab.copied" class="size-3" />
        <icon-hugeicons-copy v-else class="size-3" />
      </template>
      {{ collab.copied ? collab.messages.linkCopied : collab.messages.serverCopyFileLink }}
    </AppButton>
  </template>
  <div v-if="!collab.inServerRoom" class="mb-1.5 text-xs font-medium text-surface">
    {{ collab.messages.roomLink }}
  </div>
  <SharePermission
    v-if="!collab.inServerRoom || collab.serverName"
    class="mb-1.5"
    :server="collab.inServerRoom ? (collab.serverName ?? undefined) : undefined"
  />
  <div v-if="!collab.inServerRoom" class="mb-3 flex items-center gap-1.5">
    <AppInput
      :model-value="collab.shareURL"
      readonly
      :aria-label="collab.messages.roomLink"
      data-test-id="collab-room-link"
      class="min-w-0 flex-1"
      @focus="selectTarget($event)"
    />
    <AppButton
      color="primary"
      variant="solid"
      data-test-id="collab-copy-link"
      @click="collab.copyLink"
    >
      <template #leading>
        <icon-hugeicons-check v-if="collab.copied" class="size-3" />
        <icon-hugeicons-copy v-else class="size-3" />
      </template>
      {{ collab.copied ? collab.messages.linkCopied : collab.messages.copyLink }}
    </AppButton>
  </div>

  <!-- On a server, people appear under their account's name. -->
  <label
    v-if="!collab.inServerRoom"
    for="collab-room-name-input"
    class="mb-1 block text-xs text-muted"
  >
    {{ collab.messages.yourName }}
  </label>
  <AppInput
    v-if="!collab.inServerRoom"
    id="collab-room-name-input"
    v-model="collab.nameDraft"
    data-test-id="collab-name-input"
    :placeholder="collab.state.localName"
    @enter="collab.saveName"
    @change="collab.saveName"
  />

  <div class="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
    <p
      v-if="room.desktopLink.value"
      class="flex shrink-0 items-center gap-3 text-[11px] whitespace-nowrap text-muted"
    >
      <a
        :href="room.desktopLink.value"
        class="text-primary underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
        data-test-id="collab-open-desktop"
      >
        {{ collab.messages.openInDesktopApp }}
      </a>
      <template v-if="room.downloadURL.value">
        <a
          :href="room.downloadURL.value"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
          data-test-id="collab-download-desktop"
        >
          {{ collab.messages.downloadDesktopApp }}
        </a>
      </template>
    </p>
    <span v-else />
    <AppButton
      color="neutral"
      variant="ghost"
      data-test-id="collab-leave"
      @click="collab.disconnect"
    >
      {{ collab.messages.leaveRoom }}
    </AppButton>
  </div>
</template>
