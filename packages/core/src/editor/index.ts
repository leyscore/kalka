export {
  assertNodeEditable,
  getNodeEditCapability,
  ReadOnlyLibraryDefinitionError
} from './capabilities'
export type { NodeEditCapability } from './capabilities'
export { DEFAULT_SNAPPING_PREFERENCES } from './preferences'
export type { SnappingPreferences } from './preferences'
export { createDefaultEditorSharedState } from './state/shared'
export {
  copyEditorViewState,
  createDefaultEditorViewState,
  pickEditorViewState
} from './state/view'
export { createDefaultEditorState, createEditor } from './create'
export { executeAtomicTool } from './history/atomic-tool'
export type { MoveOriginal } from './undo'
export { isEmptyDocumentChange, type DocumentChange } from './history/document-change'
export type { PageSnapshot } from './history/snapshot'
export { graphFromDocumentChange, graphFromPageSnapshot } from './history/snapshot-graph'
export type { ClipboardPayload, ClipboardSnapshot, CopyOptions } from './clipboard/copy'
export { pastedPropertyChanges } from './clipboard/paste/properties'
export { defaultPropertiesOf, type DefaultLayerProperties } from './shapes/default-properties'
export { resolvePasteTarget } from './clipboard/paste/target'
export { playIslandRoots } from './play/islands'
export { resolvePlayState, type InstanceState } from './play/states'
export type { PlayState } from './play/actions'
export * from './play/prototype'
export type { PrototypeLinkDrag } from './play/connections'
export type { Editor } from './create'
export type { VariableTokenFields } from './variables'
export type { TokenImportResult } from '#core/io/formats/design-tokens'
export { reapplyInstanceComponentProperties } from './components/properties'
export { INSTANCE_OVERRIDE_GROUPS, type InstanceOverrideGroup } from './components/overrides'
export {
  componentPlaygroundProperties,
  createComponentPlayground,
  type ComponentPlayground,
  type PlaygroundValues
} from './components/playground'
export { SELECT_SAME_KINDS, type SelectSameKind } from './selection/matching'
export { createGuideActions } from './guides'
export { createTextActions } from './text'
export {
  steppedFontSize,
  steppedFontWeight,
  steppedLetterSpacing,
  steppedLineHeight,
  type TextStep
} from './text/format-steps'
export { opacityFromBuffer } from './nodes'
export { layerTypeOptions, type LayerType } from './structure/layer-type'
export type { NodePreview } from './node-preview'
export type { ScaleSession } from './structure/scale'
export type { ShapeBuilderMode, ShapeBuilderSession } from './structure/shape-builder'
export { EDITOR_TOOLS, TOOL_SHORTCUTS } from './tool-registry'
export type { RenameSelectionOptions, RenameSelectionPreview } from './structure/rename'
export {
  DEFAULT_FIND_OPTIONS,
  FIND_LAYER_KINDS,
  findInPages,
  findLayerKind,
  findRanges,
  replacedText,
  type FindLayerKind,
  type FindMatch,
  type FindOptions
} from './find'
export type { EditorToolDef } from './tool-registry'
export type {
  VariantConflict,
  VariantMutationResult,
  VariantValidationIssue
} from './components/variants'
export type {
  ClipboardImageResolution,
  EditorContext,
  EditorEventName,
  EditorEvents,
  EditorOptions,
  EditorState,
  EditorSharedState,
  EditorViewState,
  ExternalTextEditor,
  FigmaClipboardImageResolver,
  ShapeBuilderOverlay,
  WidthEditOverlay,
  WidthHandle,
  TextCaretControl,
  Tool
} from './types'
