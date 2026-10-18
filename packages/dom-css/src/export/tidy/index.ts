import type { DesignDocument, DesignElement, DesignNode } from '../../types'
import { exportAttributes } from './attributes'
import { tidyDeclarations } from './declarations'
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
  const inlineStyle =
    node.inlineStyle &&
    tidyDeclarations(tidyLengths(node.inlineStyle), {
      tagName: node.tagName,
      classed: (node.sourceSceneNode?.htmlClasses.length ?? 0) > 0,
      parent: { style: parent?.inlineStyle },
      responsive: hasMedia(node) || hasMedia(parent),
      shorthands: options.shorthands
    })
  const mediaStyles = node.mediaStyles?.map((media) => ({
    ...media,
    style: tidyLengths(media.style)
  }))
  return {
    ...node,
    attrs: exportAttributes(node.attrs),
    ...(inlineStyle ? { inlineStyle } : {}),
    ...(mediaStyles ? { mediaStyles } : {}),
    children: node.children.map((child) => tidyNode(child, node, options))
  }
}

/**
 * A projected document as exports write it: the markup a developer would keep, drawing exactly
 * as the projection does. The editor's own attributes stay behind, lengths keep the decimals
 * layout resolves, and declarations that restate the browser's defaults go.
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
