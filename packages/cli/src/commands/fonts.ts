import { defineCommand } from 'citty'

import type { DocumentFontStatus } from '@open-pencil/core/rpc'

import { appTargetOptions } from '#cli/app-target'
import { bold, entity, fmtList, kv, printError } from '#cli/format'
import { loadRPCData } from '#cli/rpc-data'
type FontStatusResult = DocumentFontStatus

function statusLabel(status: FontStatusResult['faces'][number]['status']): string {
  return status === 'available' ? 'available' : status
}

export default defineCommand({
  meta: { description: 'Report fonts used by a document' },
  args: {
    file: {
      type: 'positional',
      description: 'Document file path (omit to connect to running app)',
      required: false
    },
    ...appTargetOptions,
    json: { type: 'boolean', description: 'Output as JSON' }
  },
  async run({ args }) {
    let data: FontStatusResult
    try {
      data = await loadRPCData<FontStatusResult>(args.file, 'font-status', undefined, args)
    } catch (error) {
      printError(error)
      process.exit(1)
    }

    if (args.json) {
      console.log(JSON.stringify(data, null, 2))
      return
    }

    if (data.faces.length === 0) {
      console.log('No fonts found.')
      return
    }

    console.log('')
    console.log(bold(`  ${data.faces.length} font face${data.faces.length !== 1 ? 's' : ''}`))
    console.log('')
    console.log(
      fmtList(
        data.faces.map((face) => ({
          header: entity(`${face.family}`, face.style),
          details: {
            status: statusLabel(face.status),
            ...(face.source ? { source: face.source } : {}),
            ...(face.substituteFamily ? { substitute: face.substituteFamily } : {}),
            ...(face.nodeIds.length > 0 ? { nodes: face.nodeIds.length } : {})
          }
        })),
        { compact: true }
      )
    )
    console.log('')
    console.log(kv('Faithful', data.faithful ? 'yes' : 'no'))
    console.log('')
  }
})
