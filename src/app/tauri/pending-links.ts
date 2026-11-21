import * as v from 'valibot'

import { isTauri } from '@/app/tauri/env'

const pendingLinksSchema = v.array(v.string())

/**
 * Hands `open` each link of one kind the desktop app received: those waiting at startup, then
 * each new one its `event` announces. `command` takes the waiting links from the native side
 * (`electron/src/handlers/pending.ts`); `label` names them in the console when that fails.
 */
export async function bindPendingLinks(
  { event, command, label }: { event: string; command: string; label: string },
  open: (link: string) => void
): Promise<() => void> {
  if (!isTauri()) return () => undefined
  const [{ invoke }, { listen }] = await Promise.all([
    import('@tauri-apps/api/core'),
    import('@tauri-apps/api/event')
  ])
  async function drain() {
    const links = v.parse(pendingLinksSchema, await invoke<unknown>(command))
    for (const link of links) open(link)
  }
  const stop = await listen(event, () => {
    void drain().catch((error: unknown) => console.error(`[${label}]`, error))
  })
  await drain()
  return stop
}
