/**
 * Automatic updates come with signed Electron releases (V1). Until then there is never an
 * update to offer, and the app's updater flows stay idle.
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

export async function check(): Promise<Update | null> {
  return null
}
