/// <reference types="@figma/plugin-typings" />

import type { FigmaAPI } from './index'
import type {
  FigmaComponentNode,
  FigmaComponentSetNode,
  FigmaInstanceNode,
  FigmaSlotNode
} from './node-types'
import type { FigmaNodeProxy } from './proxy'
import type { UNSUPPORTED_PLUGIN_API, UnsupportedPluginAPIMember } from './unsupported'
import type { FigmaVariable, FigmaVariableCollection, FigmaVariablesAPI } from './variables'

type Expect<T extends true> = T

type IncompatibleKeys<Actual, Expected> = {
  [K in keyof Expected]: K extends keyof Actual ? (Actual[K] extends Expected[K] ? never : K) : K
}[keyof Expected]

export type SupportedPluginAPI = Pick<
  PluginAPI,
  | 'base64Decode'
  | 'base64Encode'
  | 'loadAllPagesAsync'
  | 'loadFontAsync'
  | 'notify'
  | 'createComponent'
  | 'createEllipse'
  | 'createFrame'
  | 'createLine'
  | 'createNodeFromSvg'
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

type Extends<Actual, Expected> = Actual extends Expected ? true : false

type Equal<Actual, Expected> = [Actual] extends [Expected]
  ? [Expected] extends [Actual]
    ? true
    : false
  : false

type ComponentPropertyDefinitionsMatch = Expect<
  Equal<FigmaComponentNode['componentPropertyDefinitions'], ComponentPropertyDefinitions>
>
const _componentPropertyDefinitionsMatch: ComponentPropertyDefinitionsMatch = true

type ComponentPropertyMethodsMatch = Expect<
  Extends<FigmaComponentNode['addComponentProperty'], ComponentNode['addComponentProperty']>
>
const _componentPropertyMethodsMatch: ComponentPropertyMethodsMatch = true

type ComponentSetPropertyMethodsMatch = Expect<
  Extends<FigmaComponentSetNode['editComponentProperty'], ComponentSetNode['editComponentProperty']>
>
const _componentSetPropertyMethodsMatch: ComponentSetPropertyMethodsMatch = true

type InstancePropertySurfaceMatch = Expect<
  Extends<
    Pick<
      FigmaInstanceNode,
      | 'componentProperties'
      | 'componentPropertyReferences'
      | 'setProperties'
      | 'isExposedInstance'
      | 'exposedInstances'
      | 'getMainComponentAsync'
      | 'detachInstance'
      | 'swapComponent'
    >,
    Pick<
      InstanceNode,
      | 'componentProperties'
      | 'componentPropertyReferences'
      | 'setProperties'
      | 'isExposedInstance'
      | 'exposedInstances'
      | 'getMainComponentAsync'
      | 'detachInstance'
      | 'swapComponent'
    >
  >
>

const _instancePropertySurfaceMatch: InstancePropertySurfaceMatch = true

type SlotSurfaceMatch = Expect<
  Extends<
    Pick<FigmaComponentNode, 'createSlot'> &
      Pick<FigmaSlotNode, 'type' | 'resetSlot' | 'limitViolations'>,
    Pick<ComponentNode, 'createSlot'> & Pick<SlotNode, 'type' | 'resetSlot' | 'limitViolations'>
  >
>
const _slotSurfaceMatch: SlotSurfaceMatch = true

type CSSMethodMatch = Expect<Extends<FigmaNodeProxy['getCSSAsync'], FrameNode['getCSSAsync']>>
const _cssMethodMatch: CSSMethodMatch = true

// `Effect` here is Figma's plugin-typings union; Kalka reads and writes a subset of it.
type EffectShapeMatch = Expect<Extends<FigmaNodeProxy['effects'][number], Effect>>
const _effectShapeMatch: EffectShapeMatch = true

// Variables and collections are handles on a subset of Figma's; the members checked below match.
type VariablesAPIMembers = 'createVariableAlias' | 'createVariableAliasByIdAsync'
type VariablesAPISurfaceMatch = Expect<
  Extends<Pick<FigmaVariablesAPI, VariablesAPIMembers>, Pick<VariablesAPI, VariablesAPIMembers>>
>
const _variablesAPISurfaceMatch: VariablesAPISurfaceMatch = true

type VariableFields = 'id' | 'name' | 'description' | 'variableCollectionId' | 'remote' | 'key'
type VariableSurfaceMatch = Expect<
  Extends<Pick<FigmaVariable, VariableFields>, Pick<Variable, VariableFields>>
>
const _variableSurfaceMatch: VariableSurfaceMatch = true

type CollectionMembers =
  | 'id'
  | 'name'
  | 'modes'
  | 'defaultModeId'
  | 'variableIds'
  | 'addMode'
  | 'renameMode'
  | 'removeMode'
type CollectionSurfaceMatch = Expect<
  Extends<
    Pick<FigmaVariableCollection, CollectionMembers>,
    Pick<VariableCollection, CollectionMembers>
  >
>
const _collectionSurfaceMatch: CollectionSurfaceMatch = true

// `UNSUPPORTED_PLUGIN_API` names every member `FigmaAPI` lacks, and no member it has.
type UnsupportedListMatch = Expect<
  Equal<keyof typeof UNSUPPORTED_PLUGIN_API, UnsupportedPluginAPIMember>
>
const _unsupportedListMatch: UnsupportedListMatch = true
