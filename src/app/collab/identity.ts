import { createGlobalState, useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

import type { Color } from '@kalka/scene-graph/primitives'
import { randomIndex } from '@kalka/scene-graph/random'

import { generateGuestName } from '@/app/collab/guest-name'
import { PEER_COLORS } from '@/constants'

export const COLLAB_NAME_STORAGE_KEY = 'op-collab-name'
const COLLAB_COLOR_STORAGE_KEY = 'kalka:collab-color'

/**
 * Who this person is in every room: one name for the whole app, kept across sessions, and one
 * color, both kept across sessions. Until they set a name they join as a generated one, such as
 * "Teal Fox", so a room opens without asking first.
 */
export const useCollabIdentity = createGlobalState(() => {
  const storedName = useLocalStorage(COLLAB_NAME_STORAGE_KEY, '')
  const guestName = generateGuestName()
  // The color stays the same on every launch, like the avatar drawn in it.
  const colorIndex = useLocalStorage(COLLAB_COLOR_STORAGE_KEY, randomIndex(PEER_COLORS.length))
  const color: Color = PEER_COLORS[colorIndex.value] ?? PEER_COLORS[0]
  const name = computed(() => storedName.value.trim() || guestName)
  const hasChosenName = computed(() => storedName.value.trim().length > 0)

  function setName(next: string) {
    storedName.value = next.trim()
  }

  return { name, guestName, color, hasChosenName, setName }
})
