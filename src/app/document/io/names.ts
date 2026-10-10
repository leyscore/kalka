export function documentNameFromFigPath(path: string): string {
  return (
    path
      .split(/[\\/]/)
      .pop()
      ?.replace(/\.(fig|kalka)$/i, '') ?? 'Untitled'
  )
}

export function downloadNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() ?? 'Untitled.fig'
}

export function figDownloadName(fileName: string, sourceFormat: string): string {
  if (sourceFormat === 'fig' || sourceFormat === 'kalka') return fileName
  return fileName.replace(/\.[^.]+$/i, '.fig')
}
