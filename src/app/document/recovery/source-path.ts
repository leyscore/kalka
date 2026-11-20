import type { RecoverySnapshotInput, RecoverySnapshotMeta } from '@/app/document/recovery/types'

const RESTORABLE_FILE = /\.(?:fig|kalka)$/i

/**
 * The path a restored snapshot can save back to: a single `.fig` or `.kalka` file. A Kalka folder
 * is not one, since the snapshot holds the document as a `.fig` file.
 */
export function restorableFilePath(path: string | null): string | null {
  return path && RESTORABLE_FILE.test(path) ? path : null
}

/** The snapshot metadata field for the input's source path, empty when it has none. */
export function recoverySourcePath(
  input: RecoverySnapshotInput
): Pick<RecoverySnapshotMeta, 'sourcePath'> {
  const sourcePath = restorableFilePath(input.sourcePath ?? null)
  return sourcePath ? { sourcePath } : {}
}
