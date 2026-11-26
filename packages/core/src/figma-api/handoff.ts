import * as v from 'valibot'

import {
  ANNOTATION_CATEGORIES,
  ANNOTATION_PROPERTIES,
  addAnnotation,
  canHaveDevStatus,
  documentAnnotationCategories,
  frameReview,
  handoffLabel,
  inheritedDevResources,
  isDevResourceURL,
  setFrameDevStatus,
  type DevResource,
  type SceneGraph
} from '@kalka/scene-graph'

import {
  assertProxyEditable,
  graph,
  raw,
  updateNode,
  type NodeProxyInternals,
  type ProxyThis
} from '#core/figma-api/accessor-utils'

/**
 * Handoff through the Plugin API: a layer's `annotations`, a frame's or a section's `devStatus`,
 * and its dev resources (`getDevResourcesAsync` and the calls that add, edit and delete one), in
 * Figma's shapes. An annotation's `categoryId` names a preset (`accessibility`...) or the ID of
 * one of the document's own categories.
 */

/** Who a script's annotations and statuses are from. */
const SCRIPT_AUTHOR = { kind: 'agent' as const, name: 'Script' }

const annotationSchema = v.object({
  label: v.optional(v.string()),
  labelMarkdown: v.optional(v.string()),
  properties: v.optional(v.array(v.object({ type: v.picklist(ANNOTATION_PROPERTIES) }))),
  categoryId: v.optional(v.string())
})

const devStatusSchema = v.nullable(
  v.object({
    type: v.picklist(['READY_FOR_DEV', 'COMPLETED']),
    description: v.optional(v.string())
  })
)

function annotationsOf(scene: SceneGraph, nodeId: string) {
  return (scene.getNode(scene.rootId)?.comments ?? []).filter(
    (thread) => thread.anchor.nodeId === nodeId && thread.annotation
  )
}

function setAnnotations(scene: SceneGraph, nodeId: string, value: unknown): void {
  const parsed = v.safeParse(v.array(annotationSchema), value)
  if (!parsed.success) throw new Error(`Invalid annotations: ${v.summarize(parsed.issues)}`)
  const kept = (scene.getNode(scene.rootId)?.comments ?? []).filter(
    (thread) => !(thread.anchor.nodeId === nodeId && thread.annotation)
  )
  const known = new Set<string>([
    ...ANNOTATION_CATEGORIES,
    ...documentAnnotationCategories(scene).map((category) => category.id)
  ])
  const unknown = parsed.output.find(
    (annotation) => annotation.categoryId !== undefined && !known.has(annotation.categoryId)
  )
  if (unknown) throw new Error(`Unknown annotation category: ${unknown.categoryId}`)
  scene.updateNode(scene.rootId, { comments: kept })
  for (const annotation of parsed.output)
    addAnnotation(scene, nodeId, SCRIPT_AUTHOR, {
      label: annotation.label ?? annotation.labelMarkdown ?? '',
      category: annotation.categoryId,
      properties: (annotation.properties ?? []).map((property) => property.type)
    })
}

interface FigmaDevResource extends DevResource {
  nodeId: string
  /** The main component or set a link on an instance comes from. */
  inheritedNodeId?: string
}

function resourcesWithChildren(
  scene: SceneGraph,
  nodeId: string,
  includeChildren: boolean
): FigmaDevResource[] {
  const node = scene.getNode(nodeId)
  if (!node) return []
  const own = [
    ...node.devResources.map((resource) => ({ ...resource, nodeId })),
    ...inheritedDevResources(scene, node).map(({ resource, from }) => ({
      ...resource,
      nodeId,
      inheritedNodeId: from.id
    }))
  ]
  if (!includeChildren) return own
  return [
    ...own,
    ...scene.getChildren(nodeId).flatMap((child) => resourcesWithChildren(scene, child.id, true))
  ]
}

function checkedURL(url: unknown): string {
  if (typeof url !== 'string' || !isDevResourceURL(url.trim()))
    throw new Error('A dev resource is a web link that starts with http:// or https://')
  return url.trim()
}

export function installHandoffAccessors(prototype: object, internals: NodeProxyInternals): void {
  const resources = (target: ProxyThis): DevResource[] => raw(target, internals).devResources
  Object.defineProperties(prototype, {
    annotations: {
      get(this: ProxyThis) {
        const scene = graph(this, internals)
        return Object.freeze(
          annotationsOf(scene, raw(this, internals).id).map((thread) => ({
            label: handoffLabel(thread),
            properties: (thread.annotation?.properties ?? []).map((type) => ({ type })),
            ...(thread.annotation?.category ? { categoryId: thread.annotation.category } : {})
          }))
        )
      },
      set(this: ProxyThis, value: unknown) {
        assertProxyEditable(this, internals)
        setAnnotations(graph(this, internals), raw(this, internals).id, value)
      }
    },
    devStatus: {
      get(this: ProxyThis) {
        const scene = graph(this, internals)
        const review = frameReview(scene, raw(this, internals).id)
        if (!review) return null
        return {
          // Changed since it was marked ready is still ready, with a change to look at.
          type: review.status === 'completed' ? 'COMPLETED' : 'READY_FOR_DEV',
          ...(review.description ? { description: review.description } : {})
        }
      },
      set(this: ProxyThis, value: unknown) {
        const parsed = v.safeParse(devStatusSchema, value)
        if (!parsed.success) throw new Error('devStatus takes { type, description } or null')
        const scene = graph(this, internals)
        const id = raw(this, internals).id
        if (!canHaveDevStatus(scene, id))
          throw new Error('Only a top-level frame or a section takes a dev status')
        assertProxyEditable(this, internals)
        const status = parsed.output
        setFrameDevStatus(
          scene,
          id,
          status ? (status.type === 'COMPLETED' ? 'completed' : 'ready') : null,
          SCRIPT_AUTHOR.name,
          { description: status?.description }
        )
      }
    },
    getDevResourcesAsync: {
      value(this: ProxyThis, options?: { includeChildren?: boolean }) {
        const scene = graph(this, internals)
        return Promise.resolve(
          resourcesWithChildren(scene, raw(this, internals).id, options?.includeChildren === true)
        )
      }
    },
    addDevResourceAsync: {
      value(this: ProxyThis, url: unknown, name?: unknown): Promise<void> {
        try {
          const address = checkedURL(url)
          if (resources(this).some((resource) => resource.url === address))
            throw new Error(`The layer already links to ${address}`)
          updateNode(this, internals, {
            devResources: [
              ...resources(this),
              { url: address, name: typeof name === 'string' ? name.trim() : '' }
            ]
          })
          return Promise.resolve()
        } catch (error) {
          return Promise.reject(error)
        }
      }
    },
    editDevResourceAsync: {
      value(
        this: ProxyThis,
        currentURL: unknown,
        next: { name?: unknown; url?: unknown }
      ): Promise<void> {
        try {
          const list = resources(this)
          const at = list.findIndex((resource) => resource.url === currentURL)
          if (at === -1) throw new Error(`The layer has no dev resource at ${String(currentURL)}`)
          const current = list[at]
          const url = next.url === undefined ? current.url : checkedURL(next.url)
          const name = typeof next.name === 'string' ? next.name.trim() : current.name
          updateNode(this, internals, {
            devResources: list.map((resource, index) => (index === at ? { url, name } : resource))
          })
          return Promise.resolve()
        } catch (error) {
          return Promise.reject(error)
        }
      }
    },
    deleteDevResourceAsync: {
      value(this: ProxyThis, url: unknown): Promise<void> {
        try {
          const list = resources(this)
          if (!list.some((resource) => resource.url === url))
            throw new Error(`The layer has no dev resource at ${String(url)}`)
          updateNode(this, internals, {
            devResources: list.filter((resource) => resource.url !== url)
          })
          return Promise.resolve()
        } catch (error) {
          return Promise.reject(error)
        }
      }
    }
  })
}
