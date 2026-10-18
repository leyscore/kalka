import type { DesignDocument, DesignNode } from '../../types'
import { exportAttributes } from './attributes'

function tidyNode(node: DesignNode): DesignNode {
  if (node.type === 'text') return node
  return {
    ...node,
    attrs: exportAttributes(node.attrs),
    children: node.children.map(tidyNode)
  }
}

/**
 * A projected document as exports write it: the markup a developer would keep, drawing exactly
 * as the projection does. The editor's own attributes stay behind.
 */
export function tidyDesignDocument(document: DesignDocument): DesignDocument {
  return { ...document, children: document.children.map(tidyNode) }
}

export { exportAttributes, shaderSettings, SHADER_ATTR } from './attributes'
