interface FilePickerOptions {
  types?: { description: string; accept: Record<string, string[]> }[]
  suggestedName?: string
}

interface Window {
  showOpenFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle[]>
  showSaveFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle>
}
