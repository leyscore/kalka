export { CODEGEN_PROMPT, DESIGN_GUIDE } from './prompts'

export { getComponentCatalog, registerComponentCatalog } from './component-catalog'
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
export { askUser, finishWorkingOnNodes, setStatus } from './presence'
export { claimWaitingComments } from './comments'
