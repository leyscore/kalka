export {
  ANTI_SLOP_GUIDE,
  CODEGEN_PROMPT,
  DESIGN_GUIDE,
  STYLE_NAMES,
  STYLE_SYSTEM,
  styleGuide,
  type StyleName
} from './prompts'

export { getComponentCatalog, registerComponentCatalog } from './component-catalog'
// Kalka Fresh is built with the Figma API, so it ships with the tools rather than `library`.
export { buildFreshLibraryGraph, freshLibraryRevision } from '#core/library/fresh/build'
export {
  insertFreshComponent,
  type InsertedFresh,
  type InsertFreshInput
} from '#core/library/fresh/insert'
export type {
  ComponentCatalog,
  ComponentCatalogInsertInput,
  ComponentCatalogLibraryAsset
} from './component-catalog'
export { ALL_TOOLS, CORE_TOOLS, EXTENDED_TOOLS } from './registry'
export { exportImage } from './vector'
export {
  defineTool,
  nodeToResult,
  nodeSummary,
  requireNode,
  NodeNotFoundError,
  toolChangesDocument
} from './schema'
export type { ToolDef, ToolExecution, ToolCapability, ToolOutput } from './schema'
export {
  isAtomicTool,
  isToolExposed,
  toolInputFor,
  returnsFile,
  parseToolArgs,
  type ToolInterface,
  type ToolExposure
} from './schema'
export { toolNumber } from './input'
export { toolsToAI, buildDebugLog } from './ai-adapter'
export type { ToolLogEntry, ToolDebugLog, AIAdapterOptions, StepBudget } from './ai-adapter'
export {
  calcClusterConfidence,
  compileScript,
  diffDocuments,
  diffPageLayersJSX,
  FigmaScriptError,
  runFigmaScript,
  wrapEvalCode
} from './analyze'
export type {
  FigmaScriptResult,
  ScriptChanges,
  ScriptConsole,
  ScriptLogEntry,
  ScriptOptions
} from './analyze'
export type { DocumentDiff, DocumentDiffOptions, LayerJSXChange } from './analyze'
export {
  VALID_OVERLAP_CATEGORIES,
  VALID_OVERLAP_SCOPES,
  VALID_OVERLAP_SEVERITIES,
  parseOverlapCategories,
  parseOverlapScope,
  parseOverlapSeverity
} from './analyze/overlaps/params'
export { setPexelsAPIKey, setUnsplashAccessKey } from './stock-photo'
export { importSVG } from './create'
export { editCSSClass, setHTMLElement } from './html'
export { askUser, finishWorkingOnNodes, readStyle, setStatus, styleNamed } from './presence'
export {
  findReferences,
  REFERENCE_COUNT,
  searchReferences,
  type VisualReference
} from './references'
export { claimWaitingComments } from './comments'
