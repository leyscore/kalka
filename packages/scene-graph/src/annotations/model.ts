import * as v from 'valibot'

/**
 * Annotations and pinned measurements: notes for developers attached to a layer, as Figma's Dev
 * Mode leaves them. They are a kind of comment thread (`CommentThread.annotation` or
 * `.measurement`): they live with the document's comments, follow their layer, and are never
 * resolved. An annotation can pin chosen properties of its layer, which show their current value.
 */

/** Figma's annotation categories, as its presets name them. */
export const ANNOTATION_CATEGORIES = [
  'accessibility',
  'behavior',
  'content',
  'development',
  'interaction'
] as const
export type AnnotationCategory = (typeof ANNOTATION_CATEGORIES)[number]

/**
 * Properties an annotation can pin, with the Plugin API's names, in the order of Figma's
 * `AnnotationPropertyType`, which `.fig` files store by index.
 */
export const ANNOTATION_PROPERTIES = [
  'fills',
  'strokes',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'strokeWeight',
  'cornerRadius',
  'effects',
  'textStyleId',
  'textAlignHorizontal',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'itemSpacing',
  'padding',
  'layoutMode',
  'alignItems',
  'opacity',
  'mainComponent',
  'fontStyle',
  'gridRowGap',
  'gridColumnGap',
  'gridRowCount',
  'gridColumnCount',
  'gridRowAnchorIndex',
  'gridColumnAnchorIndex',
  'gridRowSpan',
  'gridColumnSpan'
] as const
export type AnnotationProperty = (typeof ANNOTATION_PROPERTIES)[number]

/**
 * How a pinned property is named where it shows: by the CSS property it becomes, since a layer
 * is HTML and CSS, so developers read the name they write.
 */
export const ANNOTATION_PROPERTY_CSS: Record<AnnotationProperty, string> = {
  fills: 'background',
  strokes: 'border-color',
  width: 'width',
  height: 'height',
  minWidth: 'min-width',
  minHeight: 'min-height',
  maxWidth: 'max-width',
  maxHeight: 'max-height',
  strokeWeight: 'border-width',
  cornerRadius: 'border-radius',
  effects: 'box-shadow',
  textStyleId: 'font',
  textAlignHorizontal: 'text-align',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  itemSpacing: 'gap',
  padding: 'padding',
  layoutMode: 'flex-direction',
  alignItems: 'align-items',
  opacity: 'opacity',
  mainComponent: 'component',
  fontStyle: 'font-style',
  gridRowGap: 'row-gap',
  gridColumnGap: 'column-gap',
  gridRowCount: 'grid-template-rows',
  gridColumnCount: 'grid-template-columns',
  gridRowAnchorIndex: 'grid-row-start',
  gridColumnAnchorIndex: 'grid-column-start',
  gridRowSpan: 'grid-row-end',
  gridColumnSpan: 'grid-column-end'
}

export interface CommentAnnotation {
  category?: AnnotationCategory
  /** Properties of the layer shown with the note, with their current values. */
  properties: AnnotationProperty[]
}

/** The side of a layer a measurement starts from, as Figma's measurements store it. */
export const MEASUREMENT_SIDES = ['top', 'bottom', 'left', 'right'] as const
export type MeasurementSide = (typeof MEASUREMENT_SIDES)[number]

/**
 * A distance kept on the canvas: from one side of the thread's layer to the same or the opposite
 * side of another layer, or of the same layer for its own width or height.
 */
export interface CommentMeasurement {
  toNodeId: string
  side: MeasurementSide
  toSameSide: boolean
}

export const annotationSchema = v.object({
  category: v.optional(v.picklist(ANNOTATION_CATEGORIES)),
  properties: v.pipe(
    v.array(v.string()),
    v.transform((names) => ANNOTATION_PROPERTIES.filter((name) => names.includes(name)))
  )
})

export const measurementSchema = v.object({
  toNodeId: v.string(),
  side: v.picklist(MEASUREMENT_SIDES),
  toSameSide: v.boolean()
})
