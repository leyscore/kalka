import type { Ref } from 'vue'

import { nodeToXPath } from '@kalka/core/xpath'
import { layerCSS } from '@kalka/scene-graph/css-model'

import type { EditorStore } from '@/app/editor/active-store'
import { pasteClipboardToReplace } from '@/app/editor/clipboard/paste-to-replace'
import { copyLayersAsPNG } from '@/app/editor/clipboard/png'
import {
  copySelectionProperties,
  pasteClipboardProperties
} from '@/app/editor/clipboard/properties'
import { executeClipboardCommand } from '@/app/editor/clipboard/system'
import { createTextClipboard } from '@/app/editor/clipboard/text'
import { canVectorizeImageNode, vectorizeImageNode } from '@/app/editor/vectorize'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'

export function createCanvasMenuActions(store: EditorStore, selectedIds: Ref<Set<string>>) {
  const copyText = createTextClipboard()

  function ids() {
    return [...selectedIds.value]
  }

  function execCommand(cmd: 'copy' | 'cut' | 'paste') {
    const { cursorCanvasX: ccx, cursorCanvasY: ccy } = store.state
    const cursorPos = ccx != null && ccy != null ? { x: ccx, y: ccy } : undefined
    void executeClipboardCommand(store, cmd, cursorPos).then((ok) => {
      if (!ok) toast.error(notificationMessages.get().clipboardAccessBlocked)
      return undefined
    })
  }

  async function clipboardWrite(text: string | null, label: string) {
    if (text) await copyText(text, label)
  }

  async function copyNodeId() {
    const nodeIds = ids()
    if (nodeIds.length === 0) return
    const messages = notificationMessages.get()
    await clipboardWrite(
      nodeIds.join(', '),
      nodeIds.length > 1 ? messages.nodeIDs : messages.nodeID
    )
  }

  async function copyXPath() {
    const nodeIds = ids()
    if (nodeIds.length === 0) return
    const xpaths = nodeIds
      .map((id) => nodeToXPath(store.graph, id))
      .filter((xpath): xpath is string => xpath !== null)
    if (xpaths.length === 0) return
    const messages = notificationMessages.get()
    await clipboardWrite(xpaths.join('\n'), xpaths.length > 1 ? messages.xPaths : messages.xPath)
  }

  /** Figma's Copy as CSS: each selected layer's CSS, under a comment naming it. */
  async function copyAsCSS() {
    const blocks = ids().flatMap((id) => {
      const node = store.graph.getNode(id)
      if (!node) return []
      const parent = node.parentId ? store.graph.getNode(node.parentId) : undefined
      const lines = Object.entries(layerCSS(node, parent)).map(
        ([property, value]) => `${property}: ${value};`
      )
      return [[`/* ${node.name.replaceAll('*/', '* /')} */`, ...lines].join('\n')]
    })
    await clipboardWrite(blocks.length > 0 ? blocks.join('\n\n') : null, 'CSS')
  }

  function copyAsPNG() {
    return copyLayersAsPNG(store, ids())
  }

  return {
    ids,
    execCommand,
    pasteToReplace: () => pasteClipboardToReplace(store),
    copyProperties: () => copySelectionProperties(store),
    pasteProperties: () => pasteClipboardProperties(store),
    clipboardWrite,
    copyNodeId,
    copyXPath,
    copyAsPNG,
    copyAsCSS,
    canVectorizeImage: () => {
      void selectedIds.value
      return canVectorizeImageNode(store)
    },
    vectorizeImage: async () => {
      const nodeId = ids()[0]
      if (nodeId) await vectorizeImageNode(store, nodeId)
    }
  }
}
