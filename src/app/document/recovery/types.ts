export interface RecoverySnapshotMeta {
  id: string
  documentName: string
  updatedAt: string
  byteLength: number
  formatVersion: 1
  /** The `.fig` or `.kalka` file the document was opened from, when it had one. */
  sourcePath?: string
}

export interface RecoverySnapshot extends RecoverySnapshotMeta {
  figBytes: Uint8Array
}

export interface RecoverySnapshotInput {
  id: string
  documentName: string
  figBytes: Uint8Array
  sourcePath?: string | null
}

export interface RecoveryStore {
  list(): Promise<RecoverySnapshotMeta[]>
  read(id: string): Promise<RecoverySnapshot | null>
  write(input: RecoverySnapshotInput): Promise<RecoverySnapshotMeta>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}
