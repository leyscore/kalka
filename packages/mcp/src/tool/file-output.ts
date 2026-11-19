import { compact } from 'es-toolkit/array'
import { omit } from 'es-toolkit/object'

/** Tools whose `path` argument names a file the server writes their result to. */
const FILE_OUTPUT_TOOLS: ReadonlySet<string> = new Set(['export_svg', 'export_image', 'get_jsx'])

const FILE_OUTPUT_HINTS: Partial<Record<string, string>> = {
  get_jsx: 'Pass path to write the complete JSX to a file.'
}

/** A server without a root writes no file, so it does not pass a tool its output path. */
export function withoutOutputPath(
  toolName: string,
  args: Record<string, unknown>
): Record<string, unknown> {
  return FILE_OUTPUT_TOOLS.has(toolName) ? omit(args, ['path']) : args
}

/** A cut result names the argument that gets all of it, when the server can write files. */
export function withFileOutputHint<T extends Record<string, unknown>>(
  toolName: string,
  result: T | undefined,
  canWriteFiles: boolean
): T | undefined {
  const hint = FILE_OUTPUT_HINTS[toolName]
  if (!canWriteFiles || !hint || result?.truncated !== true) return result
  const note = typeof result.note === 'string' ? result.note : undefined
  return { ...result, note: compact([note, hint]).join(' ') }
}
