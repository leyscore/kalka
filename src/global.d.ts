import type { KalkaWindowAPI } from './app/browser-bridge'

export {}

declare global {
  interface FilePickerAcceptType {
    description: string
    accept: Record<string, string[]>
  }

  interface FilePickerOptions {
    multiple?: boolean
    types?: FilePickerAcceptType[]
    suggestedName?: string
  }

  interface FileSystemHandle {
    /** File System Access permission prompt; Chromium only, and only during a user gesture. */
    requestPermission?(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
  }

  interface DataTransferItem {
    /** File System Access drag support; Chromium only. */
    getAsFileSystemHandle?(): Promise<FileSystemHandle | null>
  }

  /** A colour the EyeDropper API picked, as `#rrggbb` in sRGB. */
  interface ColorSelectionResult {
    sRGBHex: string
  }

  /** The EyeDropper API: Chromium and Electron only, so guarded at run time. */
  interface EyeDropper {
    open(options?: { signal?: AbortSignal }): Promise<ColorSelectionResult>
  }

  interface Window {
    EyeDropper?: new () => EyeDropper
    kalka?: KalkaWindowAPI
    showOpenFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle[]>
    showSaveFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle>
    mockWindowOpen?(url: string): void
  }
}
