import { mockTauriIPC } from '#tests/helpers/tauri/mocks'

function pathArg(args: unknown, options: unknown): string {
  if (typeof args === 'object' && args !== null && 'path' in args && typeof args.path === 'string')
    return args.path
  const headers: unknown =
    typeof options === 'object' && options !== null ? Reflect.get(options, 'headers') : undefined
  const path: unknown =
    typeof headers === 'object' && headers !== null ? Reflect.get(headers, 'path') : undefined
  return typeof path === 'string' ? decodeURIComponent(path) : ''
}

/** A file system in memory, answering plugin-fs the way the desktop shell does. */
export async function memoryFileSystem(initial: Record<string, string> = {}) {
  const files = new Map<string, Uint8Array>(
    Object.entries(initial).map(([path, text]) => [path, new TextEncoder().encode(text)])
  )
  const isDirectory = (path: string) =>
    [...files.keys()].some((file) => file.startsWith(`${path.replace(/\/$/, '')}/`))
  await mockTauriIPC((cmd, args, options) => {
    const path = pathArg(args, options).replace(/\/$/, '')
    switch (cmd) {
      case 'plugin:fs|write_file':
        files.set(path, new Uint8Array(args as ArrayBuffer))
        return null
      case 'plugin:fs|read_file':
        return [...(files.get(path) ?? [])]
      case 'plugin:fs|mkdir':
        return null
      case 'plugin:fs|remove':
        for (const file of [...files.keys()])
          if (file === path || file.startsWith(`${path}/`)) files.delete(file)
        return null
      case 'plugin:fs|rename': {
        const from = Reflect.get(Object(args), 'oldPath')
        const to = Reflect.get(Object(args), 'newPath')
        const content = typeof from === 'string' ? files.get(from) : undefined
        if (typeof from !== 'string' || typeof to !== 'string' || !content)
          throw new Error(`No file to rename at ${String(from)}`)
        files.delete(from)
        files.set(to, content)
        return null
      }
      case 'plugin:fs|exists':
        return files.has(path) || isDirectory(path)
      case 'plugin:fs|read_dir': {
        const names = new Map<string, boolean>()
        for (const file of files.keys()) {
          if (!file.startsWith(`${path}/`)) continue
          const [name, ...rest] = file.slice(path.length + 1).split('/')
          names.set(name, rest.length > 0)
        }
        return [...names].map(([name, directory]) => ({
          name,
          isDirectory: directory,
          isFile: !directory,
          isSymlink: false
        }))
      }
      default:
        throw new Error(`Unexpected ${cmd}`)
    }
  })
  return files
}
