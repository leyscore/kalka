import type { useCollaborationMessages } from '@kalka/vue'

import type { RoomStatus } from '@/app/collab/room/status'

type CollaborationMessages = ReturnType<typeof useCollaborationMessages>['value']

/**
 * A room's state in words: "Live · 3 here", "Only you here — …", joining, waiting, or offline.
 * A server document is saved at once, so it says where rather than waiting for others.
 */
export function roomStatusText(
  messages: CollaborationMessages,
  status: RoomStatus,
  peerCount: number,
  serverName: string | null = null
): string {
  if (serverName !== null && status === 'live') {
    return messages.serverStatusLive({ count: peerCount + 1, server: serverName })
  }
  if (serverName !== null && status === 'alone')
    return messages.serverRoomSaved({ server: serverName })
  if (status === 'live') return messages.statusLive({ count: peerCount + 1 })
  if (status === 'alone') return messages.statusAlone
  if (status === 'waiting') return messages.waitingTitle
  if (status === 'unreachable') return messages.unreachableTitle
  if (status === 'missing') return messages.serverMissingTitle
  if (status === 'empty') return messages.serverEmptyTitle
  return messages.joiningTitle
}
