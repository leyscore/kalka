import type { DesignDocument, DesignElement, DesignNode } from '#dom-css/types'

import { exportAttributes } from './attributes'
import { tidyDeclarations } from './declarations'
import { asFlexLayout } from './flow'
import { tidyLengths } from './lengths'

function hasMedia(element: DesignElement | undefined): boolean {
  return (element?.mediaStyles?.length ?? 0) > 0
}

export interface TidyOptions {
  /** Combine longhands such as the padding sides, as CSS reads best; Tailwind keeps them. */
  shorthands?: boolean
}

function tidyNode(
  node: DesignNode,
  parent: DesignElement | undefined,
  options: Required<TidyOptions>
): DesignNode {
  if (node.type === 'text') return node
  const element = asFlexLayout(node, parent?.inlineStyle)
  const inlineStyle =
    element.inlineStyle &&
    tidyDeclarations(tidyLengths(element.inlineStyle), {
      tagName: element.tagName,
      empty: element.children.length === 0,
      classed: (element.sourceSceneNode?.htmlClasses.length ?? 0) > 0,
      parent: { style: parent?.inlineStyle },
      responsive: hasMedia(element) || hasMedia(parent),
      shorthands: options.shorthands
    })
  const tidy: DesignElement = {
    ...element,
    attrs: exportAttributes(element.attrs),
    children: element.children.map((child) => tidyNode(child, element, options))
  }
  if (inlineStyle) tidy.inlineStyle = inlineStyle
  if (element.mediaStyles)
    tidy.mediaStyles = element.mediaStyles.map((media) => ({
      ...media,
      style: tidyLengths(media.style)
    }))
  return tidy
}

/**
 * A projected document as exports write it: the markup a developer would keep, drawing exactly
 * as the projection does. The editor's own attributes stay behind, lengths keep the decimals
 * layout resolves, declarations that restate the browser's defaults go, and children placed in
 * a row or a column are laid out as one.
 */
export function tidyDesignDocument(
  document: DesignDocument,
  { shorthands = true }: TidyOptions = {}
): DesignDocument {
  const options = { shorthands }
  return {
    ...document,
    children: document.children.map((node) => tidyNode(node, undefined, options))
  }
}

export { exportAttributes, shaderSettings, SHADER_ATTR } from './attributes'
