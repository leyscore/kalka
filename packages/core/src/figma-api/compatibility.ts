/// <reference types="@figma/plugin-typings" />

import type { FigmaAPI } from './index'
import type { FigmaComponentNode, FigmaComponentSetNode } from './node-types'
import type { FigmaNodeProxy } from './proxy'

type Expect<T extends true> = T

type IncompatibleKeys<Actual, Expected> = {
  [K in keyof Expected]: K extends keyof Actual ? (Actual[K] extends Expected[K] ? never : K) : K
}[keyof Expected]

export type SupportedPluginAPI = Pick<
  PluginAPI,
  | 'base64Decode'
  | 'base64Encode'
  | 'loadFontAsync'
  | 'notify'
  | 'createComponent'
  | 'createEllipse'
  | 'createFrame'
  | 'createLine'
  | 'createPolygon'
  | 'createRectangle'
  | 'createSection'
  | 'createStar'
  | 'createText'
  | 'createVector'
  | 'exclude'
  | 'flatten'
  | 'group'
  | 'intersect'
  | 'subtract'
  | 'ungroup'
  | 'union'
>

export type FigmaAPIIncompatibleKeys = IncompatibleKeys<FigmaAPI, SupportedPluginAPI>
export type FigmaAPICompatibility = Expect<FigmaAPIIncompatibleKeys extends never ? true : false>

type ComponentPropertyDefinitionsMatch = Expect<
  FigmaComponentNode['componentPropertyDefinitions'] extends ComponentPropertyDefinitions
    ? ComponentPropertyDefinitions extends FigmaComponentNode['componentPropertyDefinitions']
      ? true
      : false
    : false
>

type ComponentPropertyMethodsMatch = Expect<
  FigmaComponentNode['addComponentProperty'] extends ComponentNode['addComponentProperty']
    ? FigmaComponentSetNode['editComponentProperty'] extends ComponentSetNode['editComponentProperty']
      ? true
      : false
    : false
>

type InstancePropertySurfaceMatch = Expect<
  Pick<
    FigmaNodeProxy & InstanceNode,
    | 'componentProperties'
    | 'componentPropertyReferences'
    | 'setProperties'
    | 'isExposedInstance'
    | 'exposedInstances'
  > extends Pick<
    InstanceNode,
    | 'componentProperties'
    | 'componentPropertyReferences'
    | 'setProperties'
    | 'isExposedInstance'
    | 'exposedInstances'
  >
    ? true
    : false
>

export type ComponentPropertyAPICompatibility = ComponentPropertyDefinitionsMatch &
  ComponentPropertyMethodsMatch &
  InstancePropertySurfaceMatch
