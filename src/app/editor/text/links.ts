import { omit } from 'es-toolkit'
import { ref } from 'vue'

import { hyperlinkAt, runsWithHyperlink, type TextHyperlink } from '@kalka/scene-graph'

import type { EditorStore } from '@/app/editor/active-store'
import { targetTextNodes } from '@/app/editor/text/format'

/** The link dialog, Figma's Cmd+K: open, and the address it starts from. */
export const textLinkDialog = {
  open: ref(false),
  url: ref(''),
  /** Whether the text already has a link the dialog may remove. */
  linked: ref(false)
}

/** The link a text layer has, when one link is on every character of it. */
function wholeTextLink(store: EditorStore): TextHyperlink | null {
  const node = targetTextNodes(store).at(0)
  const link = node ? hyperlinkAt(node.styleRuns, 0) : null
  if (!node || !link) return null
  for (let index = 1; index < node.text.length; index++) {
    const other = hyperlinkAt(node.styleRuns, index)
    if (other?.type !== link.type || other.value !== link.value) return null
  }
  return link
}

/**
 * Figma's Create link (Cmd+K): opens the link dialog for the characters selected in the text
 * being edited, the whole link the caret is in, or each selected text layer as a whole.
 */
export function requestTextLink(store: EditorStore): void {
  const node = targetTextNodes(store).at(0)
  if (!node) return
  const editing = store.state.editingTextId
  const link = editing ? store.selectTextLink(editing) : wholeTextLink(store)
  textLinkDialog.url.value = link?.type === 'URL' ? link.value : ''
  textLinkDialog.linked.value = link !== null
  textLinkDialog.open.value = true
}

/**
 * Sets the link, or takes it off with null, on what the dialog was opened for, in one undo step.
 * A new link is underlined, as Figma underlines the links it creates, and losing it takes the
 * underline off again.
 */
export function setTextLink(store: EditorStore, link: TextHyperlink | null): void {
  const nodes = targetTextNodes(store)
  const first = nodes.at(0)
  if (!first) return
  const label = link ? 'Create link' : 'Remove link'
  const decoration = link ? 'UNDERLINE' : 'NONE'
  if (
    store.state.editingTextId &&
    // Taking the link off the characters leaves them with the layer's own decoration.
    store.styleTextSelection(first.id, {
      hyperlink: link ?? undefined,
      textDecoration: link ? decoration : undefined
    })
  )
    return
  store.undo.runBatch(label, () => {
    for (const node of nodes) {
      // The layer's own decoration then holds for every character, as Figma's does.
      const styleRuns = runsWithHyperlink(node.styleRuns, node.text.length, link)
        .map((run) => ({ ...run, style: omit(run.style, ['textDecoration']) }))
        .filter((run) => Object.keys(run.style).length > 0)
      store.updateNodeWithUndo(node.id, { styleRuns, textDecoration: decoration }, label)
    }
  })
}
