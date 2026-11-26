import type { GUID } from './types'

/** Figma's handoff records on a `NodeChange`: annotations, measurements, dev status and links. */

export interface KiwiAnnotation {
  label?: string
  labelV2?: string
  properties?: Array<{ type?: string }>
  categoryId?: GUID
}

export interface KiwiAnnotationMeasurement {
  id?: GUID
  fromNode?: GUID
  toNode?: GUID
  fromNodeSide?: string
  toSameSide?: boolean
  freeText?: string
}

export interface KiwiSectionStatusInfo {
  status?: string
  description?: string
  lastUpdateUnixTimestamp?: number
}

export interface KiwiDeveloperLink {
  nodeId?: string
  fileKey?: string
  linkName?: string
  linkUrl?: string
}
