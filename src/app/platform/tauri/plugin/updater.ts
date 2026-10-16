import * as v from 'valibot'

import { call, native } from '../bridge'

/**
 * Tauri's updater API over Electron's (`electron/src/handlers/updater.ts`): the main process
 * checks the release feed and downloads; restarting installs what it downloaded.
 */
export type DownloadEvent =
  | { event: 'Started'; data: { contentLength?: number } }
  | { event: 'Progress'; data: { chunkLength: number } }
  | { event: 'Finished' }

export interface Update {
  version: string
  currentVersion: string
  body?: string
  download(onEvent?: (event: DownloadEvent) => void): Promise<void>
  install(): Promise<void>
  close(): Promise<void>
}

const ReleaseSchema = v.nullable(
  v.object({ version: v.string(), currentVersion: v.string(), body: v.optional(v.string()) })
)
const ProgressSchema = v.object({ total: v.number(), delta: v.number() })

async function download(onEvent?: (event: DownloadEvent) => void): Promise<void> {
  let started = false
  const stop = native().on('updater:progress', (payload) => {
    const progress = v.safeParse(ProgressSchema, payload)
    if (!progress.success) return
    if (!started) {
      started = true
      onEvent?.({ event: 'Started', data: { contentLength: progress.output.total } })
    }
    onEvent?.({ event: 'Progress', data: { chunkLength: progress.output.delta } })
  })
  try {
    await call('updater.download')
    onEvent?.({ event: 'Finished' })
  } finally {
    stop()
  }
}

export async function check(): Promise<Update | null> {
  const release = v.parse(ReleaseSchema, await call('updater.check'))
  if (!release) return null
  return {
    ...release,
    download,
    install: () => call('updater.install'),
    close: () => Promise.resolve()
  }
}
