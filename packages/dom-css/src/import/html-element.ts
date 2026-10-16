import { parseHTMLClasses, parseHTMLTag, type SceneNode } from '@kalka/scene-graph'

import { defaultTagForNode } from '../export/tags'
import type { DesignElement } from '../types'

/** The classes HTML export writes for extracted inline styles, which are not the layer's own. */
const GENERATED_CLASS = /^op-[0-9a-z]+$/

/**
 * Keeps the tag and classes an element was written with on the layer read from it: the tag
 * when it is not the one the layer's type gives anyway, so a plain `div` stays tagless. Call it
 * once the layer's type and fills are known, since an image layer's default tag is `img`.
 */
export function applyHTMLElement(node: SceneNode, element: DesignElement): void {
  const tag = parseHTMLTag(element.tagName)
  node.htmlTag = tag && tag !== defaultTagForNode(node) ? tag : null
  node.htmlClasses = parseHTMLClasses(element.attrs.class).filter(
    (name) => !GENERATED_CLASS.test(name)
  )
}
