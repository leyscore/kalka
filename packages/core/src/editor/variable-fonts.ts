import { createClipboardFontActions } from './clipboard/fonts'
import type { EditorContext } from './types'

/**
 * Loads the faces of the text layers among `ids` whose font family a variable gives, once a
 * variable, a mode or a binding changed them: resolving a binding switches the family at once,
 * and the text is drawn and laid out again in it once its faces arrive.
 */
export function loadBoundFontFamilies(ctx: EditorContext, ids: readonly string[]): void {
  const texts = ids.filter((id) => {
    const node = ctx.graph.getNode(id)
    return node?.type === 'TEXT' && node.boundVariables.fontFamily !== undefined
  })
  if (texts.length === 0) return
  void createClipboardFontActions(ctx).loadFontsForNodes(texts)
}
