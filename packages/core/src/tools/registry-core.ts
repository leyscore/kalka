import { diffChanges, diffCreate, diffVisual, evalCode } from './analyze'
import { calc } from './calc'
import {
  getComments,
  getFrameReviews,
  replyToComment,
  resolveComment,
  setFrameReview
} from './comments'
import { render } from './create'
import { describe } from './describe'
import {
  addBreakpoint,
  editCSSClass,
  editHTML,
  getComputedStyles,
  getCSSClasses,
  getHTML,
  getScreenshot,
  setHTMLElement,
  updateCSSClass,
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
import { finishWorkingOnNodes, getDesignGuide, setStatus } from './presence'
import { diffJSX, findNodes, getJSX, getNode, getSelection } from './read'
import type { ToolDef } from './schema'
import { stockPhoto } from './stock-photo'
import { batchUpdate, deleteNode, nodeResize, reparentNode } from './structure'
import { viewportZoomToFit } from './vector'

/**
 * Core tools registered by default in AI chat (36 tools, ~6.3K schema tokens).
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
  editHTML,
  // Modify
  updateNode,
  updateStyles,
  setHTMLElement,
  getCSSClasses,
  updateCSSClass,
  editCSSClass,
  addBreakpoint,
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
  viewportZoomToFit,
  // Presence
  finishWorkingOnNodes,
  setStatus,
  getDesignGuide,
  // Comments
  getComments,
  replyToComment,
  resolveComment,
  getFrameReviews,
  setFrameReview
]
