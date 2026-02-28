interface FilePickerAcceptType {
  description: string
  accept: Record<string, string[]>
}

interface FilePickerOptions {
  types?: FilePickerAcceptType[]
  suggestedName?: string
}

interface Window {
  showOpenFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle[]>
  showSaveFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle>
  queryLocalFonts?(): Promise<
    {
      family: string
      fullName: string
      style: string
      postscriptName: string
      blob(): Promise<Blob>
    }[]
  >
}
