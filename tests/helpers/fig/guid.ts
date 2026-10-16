import type { GUID } from '@kalka/kiwi/fig/codec'

export function guid(localID: number, sessionID = 1): GUID {
  return { sessionID, localID }
}
