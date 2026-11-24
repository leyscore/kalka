import { useClipboard } from '@vueuse/core'
import { computed, inject, provide, proxyRefs, ref, watch } from 'vue'
import type { InjectionKey, ShallowUnwrapRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { useAvatar } from '@/app/collab/avatar'
import { useJoinRoom } from '@/app/collab/join'
import { serverAccount, serverSessionExpired } from '@/app/collab/server/account'
import { isServerRoom, serverDocumentLink, shareToServer } from '@/app/collab/server/documents'
import { DEFAULT_COLLAB_STATE, useCollabInjected } from '@/app/collab/use'
import { useActiveEditorStoreRef } from '@/app/editor/active-store'
import { useNotificationMessages } from '@/app/i18n/notifications'
import { presenceOf, renameAgent } from '@/app/presence/registry'
import type { FollowTarget } from '@/app/presence/types'
import { toast } from '@/app/shell/ui'
import { presenceRows as buildPresenceRows } from '@/components/presence/rows'
import { getShareURL } from '@/constants'

function createCollabPanelContext() {
  const collab = useCollabInjected()
  const avatar = useAvatar()
  const joinRoomFromInput = useJoinRoom()
  const { copy, copied } = useClipboard({ copiedDuring: 2000 })
  const { common, collaboration } = useI18n()
  const notifications = useNotificationMessages()

  const state = computed(() => collab?.state.value ?? DEFAULT_COLLAB_STATE)
  const joinInput = ref('')
  const joinError = ref(false)
  const nameDraft = ref('')
  const popoverOpen = ref(false)
  // Each time the panel opens it shows the current name, or stays empty while the person has
  // none of their own, so the field shows the generated one as its placeholder.
  watch(
    popoverOpen,
    (open) => {
      if (open) nameDraft.value = state.value.hasChosenName ? state.value.localName : ''
    },
    { immediate: true }
  )
  const peers = computed(() => collab?.remotePeers.value ?? [])
  const following = computed(() => collab?.following.value ?? null)
  const storeRef = useActiveEditorStoreRef()
  const presenceRows = computed(() => {
    const store = storeRef.value
    return buildPresenceRows(
      {
        name: state.value.localName,
        color: state.value.localColor,
        picture: avatar.url.value,
        agents: store ? presenceOf(store).agents.value : []
      },
      peers.value,
      (pageId) => store?.graph.getNode(pageId)?.name
    )
  })
  const shareURL = computed(() => (state.value.roomId ? getShareURL(state.value.roomId) : ''))

  function copyLink() {
    if (!shareURL.value) return
    void copy(shareURL.value)
    toast.info(notifications.value.linkCopied)
  }

  function saveName() {
    const name = nameDraft.value.trim()
    if (name && name !== state.value.localName) collab?.setLocalName(name)
  }

  function share() {
    if (!collab) return
    saveName()
    const roomId = collab.shareCurrentDoc()
    if (!roomId) return
    void copy(getShareURL(roomId))
    toast.info(notifications.value.linkCopied)
    popoverOpen.value = false
  }

  /** The signed-in Kalka server's name, when a file can be saved there. */
  const serverName = computed(() =>
    serverAccount.value && !serverSessionExpired.value ? serverAccount.value.serverName : null
  )
  const inServerRoom = computed(() =>
    state.value.roomId ? isServerRoom(state.value.roomId) : false
  )
  const viewOnly = computed(() => inServerRoom.value && serverAccount.value?.user.role === 'viewer')
  /** The web address of the server document, to send to a teammate; null in the desktop app. */
  const serverLink = computed(() => {
    const roomId = state.value.roomId
    const name = storeRef.value?.state.documentName ?? ''
    return roomId && inServerRoom.value ? serverDocumentLink(roomId, name) : null
  })

  function copyServerLink() {
    if (!serverLink.value) return
    void copy(serverLink.value)
    toast.info(notifications.value.linkCopied)
  }

  function shareOnServer() {
    const store = storeRef.value
    const server = serverName.value
    if (!store || !server) return
    saveName()
    popoverOpen.value = false
    shareToServer(store)
      .then((session) => {
        const link = serverDocumentLink(session.roomId, store.state.documentName)
        if (link) void copy(link)
        toast.info(
          link
            ? collaboration.value.serverSavedLinkCopied({ server })
            : collaboration.value.serverRoomSaved({ server })
        )
        return undefined
      })
      .catch((error: unknown) => {
        console.error('[Kalka server]', error)
        toast.error(collaboration.value.serverShareFailed)
      })
  }

  function join() {
    saveName()
    if (!joinRoomFromInput(joinInput.value)) {
      joinError.value = true
      return
    }
    joinInput.value = ''
    joinError.value = false
    popoverOpen.value = false
  }

  function clearJoinError() {
    joinError.value = false
  }

  function disconnect() {
    collab?.disconnect()
    popoverOpen.value = false
  }

  function follow(target: FollowTarget | null) {
    collab?.follow(target)
  }

  function renameLocalAgent(agentId: string, name: string) {
    if (storeRef.value) renameAgent(storeRef.value, agentId, name)
  }

  return {
    common,
    messages: collaboration,
    copied,
    joinInput,
    joinError,
    nameDraft,
    popoverOpen,
    state,
    following,
    presenceRows,
    shareURL,
    copyLink,
    saveName,
    share,
    serverName,
    inServerRoom,
    viewOnly,
    serverLink,
    copyServerLink,
    shareOnServer,
    join,
    clearJoinError,
    disconnect,
    follow,
    renameLocalAgent
  }
}

export type CollabPanelContext = ShallowUnwrapRef<ReturnType<typeof createCollabPanelContext>>

const COLLAB_PANEL_KEY: InjectionKey<CollabPanelContext> = Symbol('CollabPanelContext')

export function provideCollabPanel() {
  const ctx = proxyRefs(createCollabPanelContext())
  provide(COLLAB_PANEL_KEY, ctx)
  return ctx
}

export function useCollabPanelContext(): CollabPanelContext {
  const ctx = inject(COLLAB_PANEL_KEY)
  if (!ctx) throw new Error('Collab panel controls must be used within CollabPanel')
  return ctx
}
