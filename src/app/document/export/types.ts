export type ExportOptions = {
  scale?: number
  quality?: number
  /**
   * HTML only: images linked as files beside the page, saved together as a zip (the default), or
   * embedded so the page is one self-contained file.
   */
  htmlImages?: 'files' | 'embedded'
}
