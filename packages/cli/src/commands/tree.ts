import { defineCommand } from 'citty'

import { loadDocument } from '../headless'
import { fmtTree, nodeToTreeNode, printError, entity, formatType } from '../format'
import type { SceneNode } from '@open-pencil/core'

export default defineCommand({
  meta: { description: 'Print the node tree' },
  args: {
    file: { type: 'positional', description: '.fig file path', required: true },
    page: { type: 'string', description: 'Page name (default: first page)' },
    depth: { type: 'string', description: 'Max depth (default: unlimited)' },
    json: { type: 'boolean', description: 'Output as JSON' }
  },
  async run({ args }) {
    const graph = await loadDocument(args.file)
    const pages = graph.getPages()
    const maxDepth = args.depth ? Number(args.depth) : Infinity

    const page = args.page
      ? pages.find((p) => p.name === args.page)
      : pages[0]

    if (!page) {
      printError(`Page "${args.page}" not found. Available: ${pages.map((p) => p.name).join(', ')}`)
      process.exit(1)
    }

    if (args.json) {
      const buildJson = (id: string, depth: number): unknown => {
        const node = graph.getNode(id)
        if (!node) return null
        const result: Record<string, unknown> = {
          id: node.id,
          name: node.name,
          type: node.type,
          x: Math.round(node.x),
          y: Math.round(node.y),
          width: Math.round(node.width),
          height: Math.round(node.height)
        }
        if (node.childIds.length > 0 && depth < maxDepth) {
          result.children = node.childIds.map((cid) => buildJson(cid, depth + 1)).filter(Boolean)
        }
        return result
      }
      console.log(JSON.stringify(page.childIds.map((id) => buildJson(id, 0)), null, 2))
      return
    }

    const root = {
      header: entity(formatType(page.type), page.name, page.id),
      children: page.childIds
        .map((id) => graph.getNode(id))
        .filter((n): n is SceneNode => n !== undefined)
        .map((child) => nodeToTreeNode(graph, child, maxDepth))
    }

    console.log('')
    console.log(fmtTree(root, { maxDepth }))
    console.log('')
  }
})
