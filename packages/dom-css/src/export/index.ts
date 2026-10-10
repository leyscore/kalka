// SceneGraph → HTML and JSX without the CSS runtimes, so browsers can bundle it.
export {
  sceneGraphToDesignDocument,
  sceneNodeToDesignDocument,
  type SceneGraphToDesignOptions,
  type VectorElementRenderer
} from './projection'
export { canTakeHTMLTag, defaultTagForNode, tagForNode } from './tags'
export { exportHTMLBundle } from './bundle'
export { HTML_TAG_RESET_CSS } from './tag-reset'
export { isResponsiveRoot, withResponsiveStyles, type ArtboardProjector } from './responsive'
export {
  classRuleStyle,
  cssClassDeclarations,
  cssClassStylesheet,
  inlineStyleOverClasses,
  withClassRules
} from './classes'
export {
  designDocumentToTailwindJSX,
  sceneNodesToTailwindJSX,
  sceneNodesToTailwindJSXWithLayers,
  type TailwindJSXWithLayers
} from './tailwind-jsx'
export { serializeHTML } from './html'
export { characterStyleToCSS, textRunChildren } from './text-runs'
export * from '../tokens'
export * from '../behaviours'
export type {
  ExportHTMLBundle,
  ExportHTMLBundleOptions,
  ExportHTMLFile,
  WebFontFaceAsset,
  WebFontFaceRequest,
  WebFontFaceResolver
} from './bundle'
export type { DesignDocument, DesignElement, DesignNode, DesignStyleDeclaration } from '../types'
