import { useClipboard } from '@vueuse/core'
import { computed } from 'vue'

import { useViewportKind } from '@kalka/vue'

import { roomLinkURL } from '@/app/collab/room/links'
import { showsRoomDocument, type PendingRoomStatus } from '@/app/collab/room/status'
import { serverAccount } from '@/app/collab/server/account'
import { isServerRoom, linkedServers } from '@/app/collab/server/documents'
import { linkedServerURL } from '@/app/collab/server/links'
import { DEFAULT_COLLAB_STATE, useCollabInjected } from '@/app/collab/use'
import { useNotificationMessages } from '@/app/i18n/notifications'
import { openSettings } from '@/app/settings/open'
import { toast } from '@/app/shell/ui'
import { DESKTOP_DOWNLOAD_URL, getShareURL, IS_BROWSER, IS_TAURI } from '@/constants'

/** What the room screens offer for the active tab's room: its link, a desktop handoff, Leave. */
export function useRoomActions() {
  const collab = useCollabInjected()
  const notifications = useNotificationMessages()
  const { isMobile } = useViewportKind()
  const { copy, copied } = useClipboard({ copiedDuring: 2000 })

  const state = computed(() => collab?.state.value ?? DEFAULT_COLLAB_STATE)
  const leftRoom = computed(() => collab?.leftRoom.value ?? false)
  /** Whether the room's document has yet to arrive, so its screen shows instead of the editor. */
  const pendingStatus = computed<PendingRoomStatus | null>(() => {
    const status = state.value.status
    return status && !showsRoomDocument(status) ? status : null
  })
  const pending = computed(() => pendingStatus.value !== null)
  /** Who the file is coming from, while it is on its way. */
  const sender = computed(() => state.value.peers.find((peer) => peer.hasFile)?.name ?? null)
  /** People in the room who are waiting for the file too. */
  const othersWaiting = computed(() =>
    state.value.peers.filter((peer) => !peer.hasFile).map((peer) => peer.name)
  )
  /** The server a link to this document named, for someone who must sign in to it. */
  const linkedServer = computed(() => {
    const roomId = state.value.roomId
    return roomId ? (linkedServers.value.get(roomId) ?? null) : null
  })
  /** The server that keeps the room's document, for a server document: its name, or address. */
  const serverName = computed(() => {
    const roomId = state.value.roomId
    if (!roomId || !isServerRoom(roomId)) return null
    const account = serverAccount.value
    const linked = linkedServer.value
    if (account && (!linked || linked === account.url)) return account.serverName
    return linked ? new URL(linked).host : null
  })

  /** Settings › Server, with the address of the server the link named filled in. */
  function signIn() {
    const server = linkedServer.value ?? serverAccount.value?.url ?? null
    if (server) linkedServerURL.value = server
    openSettings('server')
  }
  // Browsers on a computer can hand the room to the desktop app; phones and the app cannot. A
  // server document is not a peer-to-peer room, which is all a `kalka://join` link opens.
  const desktopLink = computed(() => {
    const roomId = state.value.roomId
    if (!roomId || !IS_BROWSER || IS_TAURI || isMobile.value || isServerRoom(roomId)) return null
    return roomLinkURL(roomId)
  })
  /** Offered beside the desktop link, for people without the app. */
  const downloadURL = computed(() => (desktopLink.value ? DESKTOP_DOWNLOAD_URL : null))

  function copyLink() {
    const roomId = state.value.roomId
    if (!roomId) return
    void copy(getShareURL(roomId))
    toast.info(notifications.value.linkCopied)
  }

  function leave() {
    collab?.disconnect()
  }

  function rename(name: string) {
    collab?.setLocalName(name)
  }

  function dismissLeftRoomNote() {
    collab?.dismissLeftRoomNote()
  }

  return {
    state,
    leftRoom,
    pending,
    pendingStatus,
    sender,
    othersWaiting,
    copied,
    desktopLink,
    downloadURL,
    serverName,
    signIn,
    copyLink,
    leave,
    rename,
    dismissLeftRoomNote
  }
}
