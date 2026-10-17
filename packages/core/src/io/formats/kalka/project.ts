import * as v from 'valibot'

import { KALKA_FORMAT_ID, KALKA_FORMAT_VERSION } from './constants'

const PropsSchema = v.record(v.string(), v.unknown())

const ArtboardSchema = v.object({ id: v.string(), x: v.number(), y: v.number() })

const PageSchema = v.object({
  id: v.string(),
  name: v.string(),
  /** The page's HTML, relative to the folder. */
  file: v.string(),
  /** A page the layer list does not show, such as one holding remote components. */
  internal: v.optional(v.boolean()),
  /** Where each artboard sits on the canvas, in the page's order. */
  artboards: v.optional(v.array(ArtboardSchema)),
  props: v.optional(PropsSchema)
})

const ModeSchema = v.object({
  id: v.string(),
  name: v.string(),
  condition: v.optional(v.string()),
  /** Where Figma lists the mode, kept from a `.fig` file. */
  sortPosition: v.optional(v.string())
})

const SavedVariableSchema = v.object({
  id: v.string(),
  name: v.string(),
  props: v.optional(PropsSchema)
})

/**
 * A collection's identity: `tokens.json` holds its tokens by name, and this ties each name to the
 * id layers bind to, with what DTCG has no place for in `props`.
 */
const SavedCollectionSchema = v.object({
  id: v.string(),
  name: v.string(),
  defaultMode: v.string(),
  modes: v.array(ModeSchema),
  modeAttribute: v.optional(v.string()),
  variables: v.array(SavedVariableSchema),
  props: v.optional(PropsSchema)
})

const SettingsSchema = v.object({
  colorSpace: v.optional(v.picklist(['srgb', 'display-p3'])),
  /** The mode each collection shows in the editor. */
  activeModes: v.optional(v.record(v.string(), v.string())),
  /** Libraries the document uses, as saved props. */
  libraries: v.optional(v.unknown())
})

export const ProjectSchema = v.object({
  format: v.literal(KALKA_FORMAT_ID),
  version: v.pipe(
    v.number(),
    v.integer(),
    v.maxValue(KALKA_FORMAT_VERSION, 'This folder was saved by a newer version of Kalka')
  ),
  /** The document's root layer. */
  root: v.object({ id: v.string(), props: v.optional(PropsSchema) }),
  pages: v.array(PageSchema),
  variables: v.optional(v.array(SavedCollectionSchema)),
  settings: v.optional(SettingsSchema)
})

export type Project = v.InferOutput<typeof ProjectSchema>
export type SavedPage = v.InferOutput<typeof PageSchema>
export type SavedCollection = v.InferOutput<typeof SavedCollectionSchema>
export type SavedVariable = v.InferOutput<typeof SavedVariableSchema>

/** `project.json` as read, or why it cannot be. */
export function parseProject(text: string): Project {
  const result = v.safeParse(v.pipe(v.string(), v.parseJson(), ProjectSchema), text)
  if (result.success) return result.output
  const issue = result.issues[0]
  const where = issue.path?.map((item) => String(item.key)).join('.')
  throw new Error(`Invalid project.json${where ? ` at ${where}` : ''}: ${issue.message}`)
}
