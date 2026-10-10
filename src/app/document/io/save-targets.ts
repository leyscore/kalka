import { pickBrowserSaveFile } from '@/app/document/io/capability'

export async function chooseTauriFigSavePath() {
  const { save } = await import('@tauri-apps/plugin-dialog')
  return save({
    defaultPath: 'Untitled.fig',
    filters: [
      { name: 'Figma file', extensions: ['fig'] },
      { name: 'Kalka file', extensions: ['kalka'] }
    ]
  })
}

export async function chooseBrowserFigSaveHandle() {
  try {
    return await pickBrowserSaveFile({
      suggestedName: 'Untitled.fig',
      types: [
        {
          description: 'Figma file',
          accept: { 'application/octet-stream': ['.fig'] }
        },
        {
          description: 'Kalka file',
          accept: { 'application/zip': ['.kalka'] }
        }
      ]
    })
  } catch (error) {
    if ((error as Error).name === 'AbortError') return null
    throw error
  }
}
