import { bindPendingLinks } from '@/app/tauri/pending-links'

/** Desktop events and commands for `kalka://join?room=<id>` links (`electron/src/handlers/pending.ts`). */
export const ROOM_LINKS_EVENT = 'open-room-links'
const TAKE_PENDING_ROOMS = 'take_pending_rooms'

export function roomLinkURL(roomId: string): string {
  return `kalka://join?room=${encodeURIComponent(roomId)}`
}

/**
 * Opens the rooms of `kalka://join` links the desktop app received, at startup and while
 * running. The native side validates each room ID; `open` validates it again before joining.
 */
export function bindDesktopRoomLinks(open: (roomId: string) => void): Promise<() => void> {
  return bindPendingLinks(
    { event: ROOM_LINKS_EVENT, command: TAKE_PENDING_ROOMS, label: 'Room link' },
    open
  )
}
