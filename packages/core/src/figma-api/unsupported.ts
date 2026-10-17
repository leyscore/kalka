/// <reference types="@figma/plugin-typings" />

import type { FigmaAPI } from './index'

/** Plugin API members of `figma` that Kalka does not implement. */
export type UnsupportedPluginAPIMember = Exclude<keyof PluginAPI, keyof FigmaAPI>

const NO_PLUGIN_RUNTIME = 'Kalka scripts run without a plugin UI, session, or editor events'
const NO_STYLE_AUTHORING =
  'Kalka reads shared styles from imported files, but scripts cannot create or list them yet; use variables'
const NOT_DESIGN = 'Kalka edits design files; FigJam, Slides, Buzz, and Dev Mode APIs are absent'
const NO_LIBRARY = "Kalka has no Figma team library to import from; use the document's components"
const NOT_YET = 'Kalka does not implement this Plugin API member yet'

/**
 * Every Plugin API member `figma` lacks, with why, so a script written for Figma learns what is
 * missing instead of reading `undefined`. The type keeps it in step with `FigmaAPI`: implementing
 * a member means removing it here.
 */
export const UNSUPPORTED_PLUGIN_API = {
  activeUsers: NO_PLUGIN_RUNTIME,
  annotations: NOT_YET,
  apiVersion: NOT_YET,
  buzz: NOT_DESIGN,
  clientStorage: NO_PLUGIN_RUNTIME,
  closePlugin: 'A script ends by returning its result; return instead of closing the plugin',
  codegen: NOT_DESIGN,
  command: NO_PLUGIN_RUNTIME,
  constants: NOT_YET,
  createBooleanOperation: 'Use figma.union, figma.subtract, figma.intersect, or figma.exclude',
  createCanvasRow: NOT_DESIGN,
  createCodeBlock: NOT_DESIGN,
  createConnector: NOT_DESIGN,
  createCustomAnimationStyle: NOT_YET,
  createEffectStyle: NO_STYLE_AUTHORING,
  createGif: 'Kalka cannot create GIF layers',
  createGridStyle: NO_STYLE_AUTHORING,
  createImageAsync: 'Use figma.createImage with the image bytes',
  createLinkPreviewAsync: NOT_DESIGN,
  createNodeFromJSXAsync:
    "Widget JSX is not available: build layers with figma.create* calls, or use Kalka's render tool, which takes Kalka design JSX",
  createNodeFromSvg: "Use Kalka's import_svg tool to add SVG markup as layers",
  createPageDivider: NOT_YET,
  createPaintStyle: NO_STYLE_AUTHORING,
  createShapeWithText: NOT_DESIGN,
  createSlice: NOT_YET,
  createSlide: NOT_DESIGN,
  createSlideRow: NOT_DESIGN,
  createSticky: NOT_DESIGN,
  createTable: NOT_DESIGN,
  createTextPath: 'Kalka has no text on a path yet',
  createTextStyle: NO_STYLE_AUTHORING,
  createVideoAsync: 'Kalka cannot create video layers',
  currentUser: NO_PLUGIN_RUNTIME,
  devResources: NOT_DESIGN,
  editorType: NOT_YET,
  fileKey: 'Kalka documents are local files without a Figma file key',
  getCanvasGrid: NOT_DESIGN,
  getFileThumbnailNode: NOT_YET,
  getFileThumbnailNodeAsync: NOT_YET,
  getFontFamilyVariationAxes: NOT_YET,
  getImageByHash: NOT_YET,
  getLocalCustomAnimationStyles: NOT_YET,
  getLocalCustomAnimationStylesAsync: NOT_YET,
  getLocalEffectStyles: NO_STYLE_AUTHORING,
  getLocalEffectStylesAsync: NO_STYLE_AUTHORING,
  getLocalGridStyles: NO_STYLE_AUTHORING,
  getLocalGridStylesAsync: NO_STYLE_AUTHORING,
  getLocalPaintStyles: NO_STYLE_AUTHORING,
  getLocalPaintStylesAsync: NO_STYLE_AUTHORING,
  getLocalTextStyles: NO_STYLE_AUTHORING,
  getLocalTextStylesAsync: NO_STYLE_AUTHORING,
  getSelectionColors: NOT_YET,
  getSlideGrid: NOT_DESIGN,
  getStyleById: NO_STYLE_AUTHORING,
  getStyleByIdAsync: NO_STYLE_AUTHORING,
  hasMissingFont: 'Kalka loads the fonts a document uses after each script',
  importComponentByKeyAsync: NO_LIBRARY,
  importComponentSetByKeyAsync: NO_LIBRARY,
  importShaderById: NOT_YET,
  importStyleByKeyAsync: NO_LIBRARY,
  listAvailableShaders: NOT_YET,
  loadBrushesAsync: NOT_YET,
  mode: NO_PLUGIN_RUNTIME,
  motion: NOT_YET,
  moveLocalCustomAnimationFolderAfter: NOT_YET,
  moveLocalCustomAnimationStyleAfter: NOT_YET,
  moveLocalEffectFolderAfter: NO_STYLE_AUTHORING,
  moveLocalEffectStyleAfter: NO_STYLE_AUTHORING,
  moveLocalGridFolderAfter: NO_STYLE_AUTHORING,
  moveLocalGridStyleAfter: NO_STYLE_AUTHORING,
  moveLocalPaintFolderAfter: NO_STYLE_AUTHORING,
  moveLocalPaintStyleAfter: NO_STYLE_AUTHORING,
  moveLocalTextFolderAfter: NO_STYLE_AUTHORING,
  moveLocalTextStyleAfter: NO_STYLE_AUTHORING,
  moveNodesToCoord: NOT_YET,
  off: NO_PLUGIN_RUNTIME,
  on: NO_PLUGIN_RUNTIME,
  once: NO_PLUGIN_RUNTIME,
  openExternal: NO_PLUGIN_RUNTIME,
  parameters: NO_PLUGIN_RUNTIME,
  payments: NO_PLUGIN_RUNTIME,
  pluginId: NO_PLUGIN_RUNTIME,
  saveVersionHistoryAsync: NOT_YET,
  setCanvasGrid: NOT_DESIGN,
  setFileThumbnailNodeAsync: NOT_YET,
  setSlideGrid: NOT_DESIGN,
  showUI: NO_PLUGIN_RUNTIME,
  skipInvisibleInstanceChildren: NOT_YET,
  teamLibrary: NO_LIBRARY,
  textreview: NO_PLUGIN_RUNTIME,
  timer: NOT_DESIGN,
  transformGroup: NOT_YET,
  ui: NO_PLUGIN_RUNTIME,
  util: NOT_YET,
  vscode: NOT_DESIGN,
  widgetId: NO_PLUGIN_RUNTIME
} as const satisfies Record<UnsupportedPluginAPIMember, string>
