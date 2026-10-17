export { analyzeClusters, calcClusterConfidence } from './analyze/clusters'
export { analyzeColors } from './analyze/colors'
export {
  diffApply,
  diffChanges,
  diffCreate,
  diffDocuments,
  diffPageLayersJSX,
  diffShow,
  diffVisual
} from './analyze/diff'
export type { DocumentDiff, DocumentDiffOptions, LayerJSXChange } from './analyze/diff'
export { evalCode } from './analyze/eval'
export { useFigma } from './analyze/eval/use-figma'
export {
  FigmaScriptError,
  runFigmaScript,
  type FigmaScriptResult,
  type ScriptChanges,
  type ScriptLogEntry
} from './analyze/eval/figma-script'
export { lint, lintFix } from './analyze/lint'
export {
  compileScript,
  wrapEvalCode,
  type ScriptConsole,
  type ScriptOptions
} from './analyze/eval/wrap'
export { analyzeOverlaps, computeOverlaps } from './analyze/overlaps'
export type {
  AnalyzeOverlapsArgs,
  AnalyzeOverlapsResult,
  AnalyzeOverlapsSummary,
  OverlapCategory,
  OverlapIntersection,
  OverlapItem,
  OverlapNodeSummary,
  OverlapScope,
  OverlapSeverity
} from './analyze/overlaps'
export { analyzeSpacing } from './analyze/spacing'
export { analyzeTypography } from './analyze/typography'
