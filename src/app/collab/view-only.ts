import { computed, type ComputedRef } from 'vue'

import { useCollabInjected } from '@/app/collab/context'
import { serverAccount } from '@/app/collab/server/account'
import { isServerRoom } from '@/app/collab/server/documents'

/**
 * Whether the active document is open read-only: a Kalka server file this person may only view,
 * by their account's role or because it is shared to view. The server drops what a viewer sends;
 * the editor shows it and keeps its editing controls off. A live room has no access control, so
 * nobody in one is read-only.
 */
export function useDocumentViewOnly(): ComputedRef<boolean> {
  const collab = useCollabInjected()
  return computed(() => {
    const state = collab?.state.value
    if (!state?.roomId || !isServerRoom(state.roomId)) return false
    return (state.serverRole ?? serverAccount.value?.user.role) === 'viewer'
  })
}
