import { defineCommand } from 'citty'

import { loadDocument } from '../headless'
import { fmtList, nodeToListItem, printError, bold } from '../format'
import type { SceneNode } from '@open-pencil/core'

export default defineCommand({
  meta: { description: 'Find nodes by name or type' },
  args: {
    file: { type: 'positional', description: '.fig file path', required: true },
    name: { type: 'string', description: 'Node name (partial match, case-insensitive)' },
    type: { type: 'string', description: 'Node type: FRAME, TEXT, RECTANGLE, INSTANCE, etc.' },
    page: { type: 'string', description: 'Page name (default: all pages)' },
    limit: { type: 'string', description: 'Max results (default: 100)', default: '100' },
    json: { type: 'boolean', description: 'Output as JSON' }
  },
  async run({ args }) {
    const graph = await loadDocument(args.file)
    const pages = graph.getPages()
    const max = Number(args.limit)
    const namePattern = args.name?.toLowerCase()
    const typeFilter = args.type?.toUpperCase()

    const results: SceneNode[] = []

    const searchPage = (pageNode: SceneNode) => {
      const walk = (id: string) => {
        if (results.length >= max) return
        const node = graph.getNode(id)
        if (!node) return
        const matchesName = !namePattern || node.name.toLowerCase().includes(namePattern)
        const matchesType = !typeFilter || node.type === typeFilter
        if (matchesName && matchesType) results.push(node)
        for (const childId of node.childIds) walk(childId)
      }
      for (const childId of pageNode.childIds) walk(childId)
    }

    if (args.page) {
      const page = pages.find((p) => p.name === args.page)
      if (!page) {
        printError(`Page "${args.page}" not found.`)
        process.exit(1)
      }
      searchPage(page)
    } else {
      for (const page of pages) searchPage(page)
    }

    if (args.json) {
      console.log(JSON.stringify(results.map((n) => ({
        id: n.id, name: n.name, type: n.type,
        width: Math.round(n.width), height: Math.round(n.height)
      })), null, 2))
      return
    }

    if (results.length === 0) {
      console.log('No nodes found.')
      return
    }

    console.log('')
    console.log(bold(`  Found ${results.length} node${results.length > 1 ? 's' : ''}`))
    console.log('')
    console.log(fmtList(results.map(nodeToListItem)))
    console.log('')
  }
})
