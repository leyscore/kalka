import { writeFile } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'

import { defineCommand } from 'citty'

import { BUILTIN_IO_FORMATS, IORegistry } from '@open-pencil/core/io'
import { writeKalkaFolder } from '@open-pencil/core/io/formats/kalka'

import { requireFile } from '#cli/app/client'
import { ok, printError } from '#cli/format'
import { loadDocument, populateWholeDocument, writeFolderFiles } from '#cli/headless'

const io = new IORegistry(BUILTIN_IO_FORMATS)

/** A Kalka folder, which is a directory rather than a file of the registry. */
const FOLDER_FORMAT = 'folder'

function writableFormatIds(): string[] {
  return [...io.listWritableFormats().map((format) => format.id), FOLDER_FORMAT]
}

function defaultOutput(file: string, format: string): string {
  const base = basename(file, extname(file))
  return format === FOLDER_FORMAT ? resolve(base) : resolve(`${base}.${format.toLowerCase()}`)
}

export default defineCommand({
  meta: { description: 'Convert a document to another writable format' },
  args: {
    file: {
      type: 'positional',
      description: 'Input document file path, or a Kalka folder',
      required: true
    },
    output: {
      type: 'string',
      alias: 'o',
      description: 'Output file path (default: <name>.<format>)',
      required: false
    },
    format: {
      type: 'string',
      alias: 'f',
      description: 'Output format: fig, kalka, or folder for a Kalka folder (default: fig)',
      default: 'fig'
    }
  },
  async run({ args }) {
    const format = args.format.toLowerCase()
    const writableFormats = writableFormatIds()
    if (!writableFormats.includes(format)) {
      printError(`Invalid format "${args.format}". Use ${writableFormats.join(', ')}.`)
      process.exit(1)
    }

    const file = requireFile(args.file)
    const graph = await loadDocument(file)
    populateWholeDocument(graph)
    const output = args.output ? resolve(args.output) : defaultOutput(file, format)
    if (format === FOLDER_FORMAT) {
      await writeFolderFiles(output, await writeKalkaFolder(graph))
    } else {
      const result = await io.writeDocument(format, graph)
      await writeFile(output, result.data as Uint8Array)
    }
    console.log(ok(`Converted ${file} → ${output}`))
  }
})
