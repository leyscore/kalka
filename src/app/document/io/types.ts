export type DocumentSourceIdentity = Readonly<{
  handle: FileSystemFileHandle | null
  path: string | null
}>

export type ViewportSize = { width: number; height: number }
