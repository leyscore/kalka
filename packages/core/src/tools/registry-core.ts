import { diffChanges, diffCreate, diffVisual, evalCode } from './analyze'
import { calc } from './calc'
import { render } from './create'
import { describe } from './describe'
import {
  getComputedStyles,
  getHTML,
  getScreenshot,
  setHTMLElement,
  updateStyles,
  writeHTML
} from './html'
import {
  setFill,
  setLayout,
  setLayoutChild,
  setRadius,
  setStroke,
  setText,
  setTextProperties,
  updateNode
} from './modify'
import { diffJSX, findNodes, getJSX, getNode, getSelection } from './read'
import type { ToolDef } from './schema'
import { stockPhoto } from './stock-photo'
import { batchUpdate, deleteNode, nodeResize, reparentNode } from './structure'
import { viewportZoomToFit } from './vector'

/**
 * Core tools registered by default in AI chat (31 tools, ~5.6K schema tokens).
 * Covers 90%+ of design sessions: render and HTML, describe, modify, structure, and diff checks.
 */
export const CORE_TOOLS: ToolDef[] = [
  // Read
  getSelection,
  getNode,
  findNodes,
  getJSX,
  getHTML,
  getScreenshot,
  getComputedStyles,
  // Create
  render,
  writeHTML,
  // Modify
  updateNode,
  updateStyles,
  setHTMLElement,
  setLayout,
  setLayoutChild,
  setRadius,
  setFill,
  setStroke,
  setText,
  setTextProperties,
  // Structure
  deleteNode,
  reparentNode,
  nodeResize,
  batchUpdate,
  // Stock photos
  stockPhoto,
  // Inspect & utility
  describe,
  diffChanges,
  diffCreate,
  diffJSX,
  diffVisual,
  calc,
  evalCode,
  viewportZoomToFit
]
