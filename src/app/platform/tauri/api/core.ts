import { call } from '../bridge'
import { listSystemFonts, loadSystemFont } from '../system-fonts'

/** Commands the page answers itself: Chromium lists and reads local fonts. */
const IN_PAGE: Partial<Record<string, (args: Record<string, unknown>) => Promise<unknown>>> = {
  list_system_fonts: () => listSystemFonts(),
  load_system_font: (args) => loadSystemFont(String(args.family), String(args.style))
}

/** Tauri's `invoke`: each Rust command is a handler of the same name in Electron's main process. */
export async function invoke<T = unknown>(
  command: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const local = IN_PAGE[command]
  if (local) return (await local(args)) as T
  return call<T>(`command.${command}`, args)
}
