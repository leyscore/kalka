import type { Editor, EditorState } from '@kalka/core/editor'
import type { BuiltinIOFormatId, ExportRequest, IORegistry } from '@kalka/core/io'

import { domPrintPDF, domRasterize } from '@/app/document/export/dom-raster'
import {
  bundleExportFiles,
  createExportTargetActions,
  getExportBaseName,
  getExportBytes,
  getExportFileName,
  getExportOptions,
  hasExportAssets,
  sanitizeZipEntryName,
  saveExportedFile,
  type ExportedFile
} from '@/app/document/export/files'
import type { ExportOptions } from '@/app/document/export/types'

type DownloadBlob = (data: Uint8Array, filename: string, mime: string) => void

export interface ExportTargetRequest {
  target: ExportRequest['target']
  formatId: string
  options?: ExportOptions
}

export function createDocumentExportActions(
  editor: Editor,
  state: EditorState,
  io: IORegistry,
  downloadBlob: DownloadBlob
) {
  const { renderExportImage, getSelectionExportTarget, listSelectionExportFormats } =
    createExportTargetActions(editor, state, io)

  async function renderExportFile(
    target: ExportRequest['target'],
    formatId: string,
    options?: ExportOptions
  ): Promise<ExportedFile> {
    const format = io.getFormat(formatId)
    if (!format) throw new Error(`Unknown export format: ${formatId}`)

    const exportOptions = getExportOptions(format, options)
    const baseName = getExportBaseName(editor.graph, target)
    // A page is told the name it is saved under, which names the folder of the files it links.
    const fileName =
      format.id === 'html'
        ? sanitizeZipEntryName(getExportFileName(baseName, format, 'html', options))
        : undefined

    const browser = { rasterize: domRasterize, printPDF: domPrintPDF }
    const result = await io.exportContent(
      formatId,
      { graph: editor.graph, target, fileName },
      exportOptions,
      editor.renderer
        ? { canvasKit: editor.renderer.ck, renderer: editor.renderer, ...browser }
        : browser
    )

    return {
      bytes: getExportBytes(result.data),
      fileName: sanitizeZipEntryName(
        getExportFileName(baseName, format, result.extension, options)
      ),
      format: format.label,
      ext: `.${result.extension}`,
      mime: result.mimeType,
      assets: result.assets
    }
  }

  async function saveZip(files: ExportedFile[], baseName: string) {
    await saveExportedFile(
      bundleExportFiles(files),
      `${baseName}.zip`,
      'ZIP',
      '.zip',
      'application/zip',
      downloadBlob
    )
  }

  async function saveExportFile(file: ExportedFile) {
    // A page and the images it links travel together, so opening it from disk shows them.
    if (hasExportAssets(file)) {
      await saveZip([file], file.fileName.replace(/\.[^.]*$/, ''))
      return
    }
    await saveExportedFile(
      file.bytes,
      file.fileName,
      file.format,
      file.ext,
      file.mime,
      downloadBlob
    )
  }

  async function exportTarget(
    target: ExportRequest['target'],
    formatId: string,
    options?: ExportOptions
  ) {
    await saveExportFile(await renderExportFile(target, formatId, options))
  }

  // Export a batch of targets. A single file downloads directly; multiple files, or a
  // page with the images it links, are bundled into one zip so the user gets a single download.
  async function exportTargets(requests: ExportTargetRequest[]) {
    if (requests.length === 0) return

    const files: ExportedFile[] = []
    for (const request of requests) {
      files.push(await renderExportFile(request.target, request.formatId, request.options))
    }

    if (files.length === 1) {
      await saveExportFile(files[0])
      return
    }

    const baseNames = new Set(requests.map((r) => getExportBaseName(editor.graph, r.target)))
    const zipBaseName = baseNames.size === 1 ? [...baseNames][0] : 'export'
    await saveZip(files, sanitizeZipEntryName(zipBaseName))
  }

  async function exportSelection(scale: number, formatId: BuiltinIOFormatId) {
    await exportTarget(getSelectionExportTarget(), formatId, { scale })
  }

  return {
    renderExportImage,
    listSelectionExportFormats,
    exportTarget,
    exportTargets,
    exportSelection
  }
}
