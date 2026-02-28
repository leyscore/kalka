import { defineCommand } from 'citty'

import { loadDocument } from '../headless'
import { bold, fmtHistogram, fmtSummary, kv } from '../format'
import type { SceneNode } from '@open-pencil/core'

export default defineCommand({
  meta: { description: 'Show document info (pages, node counts, fonts)' },
  args: {
    file: { type: 'positional', description: '.fig file path', required: true },
    json: { type: 'boolean', description: 'Output as JSON' }
  },
  async run({ args }) {
    const graph = await loadDocument(args.file)
    const pages = graph.getPages()

    let totalNodes = 0
    const types: Record<string, number> = {}
    const fonts = new Set<string>()
    const pageCounts: Record<string, number> = {}

    for (const page of pages) {
      let pageCount = 0
      const walk = (id: string) => {
        const node = graph.getNode(id) as SceneNode | undefined
        if (!node) return
        totalNodes++
        pageCount++
        types[node.type] = (types[node.type] ?? 0) + 1
        if (node.fontFamily) fonts.add(node.fontFamily)
        for (const childId of node.childIds) walk(childId)
      }
      for (const childId of page.childIds) walk(childId)
      pageCounts[page.name] = pageCount
    }

    if (args.json) {
      console.log(JSON.stringify({ pages: pages.length, totalNodes, types, fonts: [...fonts].sort(), pageCounts }, null, 2))
      return
    }

    console.log('')
    console.log(bold(`  ${pages.length} pages, ${totalNodes} nodes`))
    console.log('')

    const pageItems = Object.entries(pageCounts).map(([label, value]) => ({ label, value }))
    console.log(fmtHistogram(pageItems, { unit: 'nodes' }))

    console.log('')
    console.log(fmtSummary(types))

    if (fonts.size > 0) {
      console.log('')
      console.log(kv('Fonts', [...fonts].sort().join(', ')))
    }
    console.log('')
  }
})
