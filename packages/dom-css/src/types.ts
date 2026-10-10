import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'

import type { DesignTokens } from './tokens/references'

export type DesignNode = DesignElement | DesignText

export interface DesignDocument {
  type: 'document'
  children: DesignNode[]
  stylesheets?: DesignStyleSheet[]
  sourceGraph?: SceneGraph
  /** Variable references the projection wrote, for Tailwind names and the token stylesheet. */
  tokens?: DesignTokens
  /** The page the content was rendered in: its width and the body's computed style. */
  viewport?: { width: number; height: number; bodyStyle: DesignStyleDeclaration }
}

/** Where a browser laid out a node, relative to the rendered content's top-left corner. */
export interface LayoutBox {
  x: number
  y: number
  width: number
  height: number
}

export interface DesignElement {
  type: 'element'
  tagName: string
  attrs: Record<string, string>
  children: DesignNode[]
  inlineStyle?: DesignStyleDeclaration
  computedStyle?: DesignStyleDeclaration
  sourceSceneNodeId?: string
  sourceSceneNode?: SceneNode
  /** Declarations that apply at narrower viewports, from the layer's breakpoints. */
  mediaStyles?: MediaStyle[]
  /** Where a browser rendered the element, when the document was measured. */
  layoutBox?: LayoutBox
}

/** A breakpoint's declarations for an element, written in `@media (max-width: …)`. */
export interface MediaStyle {
  maxWidth: number
  style: DesignStyleDeclaration
}

export interface DesignText {
  type: 'text'
  text: string
  /** Where a browser rendered the text, when the document was measured. */
  layoutBox?: LayoutBox
}

export interface DesignStyleSheet {
  type: 'stylesheet'
  cssText: string
  href?: string
}

export type DesignStyleDeclaration = Record<string, string>

export interface CSSComputeOptions {
  includeBrowserDefaults?: boolean
  /** The width to render the content at, as a browser window would be; 1000 when left out. */
  viewportWidth?: number
}

export interface CSSRuntime {
  readonly kind: 'browser' | 'headless'
  parseHTML(html: string): DesignDocument
  serializeHTML(document: DesignDocument): string
  computeStyles(
    document: DesignDocument,
    cssText?: string,
    options?: CSSComputeOptions
  ): Promise<DesignDocument>
}
