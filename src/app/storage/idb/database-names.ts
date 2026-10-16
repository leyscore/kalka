/** Stable names for the app's independent IndexedDB databases. */
export const APP_DATABASE_NAMES = {
  chats: 'kalka-chats',
  credentials: 'kalka-credentials',
  libraries: 'kalka-libraries',
  localCanvas: 'kalka-cloud-local',
  outbox: 'kalka-cloud-outbox',
  recovery: 'kalka-recovery',
  diagnostics: 'kalka-diagnostics',
  /** Written and deleted once per page, to learn whether the engine stores Blobs. */
  blobProbe: 'kalka-blob-probe'
} as const
