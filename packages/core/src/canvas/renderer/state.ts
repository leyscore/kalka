import type { SceneNode } from '@open-pencil/scene-graph'

import type { SkiaRenderer } from '#core/canvas/renderer'
import { changesShaping } from '#core/canvas/text/paragraph-inputs'
import {
  AI_DONE_DURATION_MS,
  FLASH_ATTACK_MS,
  FLASH_HOLD_MS,
  FLASH_RELEASE_MS
} from '#core/constants'

export function invalidateScenePicture(r: SkiaRenderer): void {
  r.scenePicture?.delete()
  r.scenePicture = null
  r.scenePictureVersion = -1
  r.scenePictureFontGeneration = -1
  r.sceneBacking?.image.delete()
  r.sceneBacking = null
  r.sceneBackingBuild?.surface.delete()
  r.sceneBackingBuild = null
}

export function clearSubtreePictureCache(r: SkiaRenderer): void {
  for (const entry of r.subtreePictureCache.values()) entry.picture.delete()
  r.subtreePictureCache.clear()
  r.subtreePictureCachePageId = null
  r.subtreePictureCacheSceneVersion = -1
  r.subtreePictureCachePositionPreviewVersion = -1
  r.subtreePictureCacheFontGeneration = -1
}

export function invalidateAllPictures(r: SkiaRenderer): void {
  r.textPreparationCache.clear()
  invalidateScenePicture(r)
  r.tiledScene.invalidateStructure()
  for (const pic of r.nodePictureCache.values()) pic?.delete()
  r.nodePictureCache.clear()
  r.nodePictureCacheGenerations.clear()
  r.nodePictureCacheDependencies.clear()
  r.effectRasterCache.clear()
  clearSubtreePictureCache(r)
}

export function invalidateNodePicture(
  r: SkiaRenderer,
  nodeId: string,
  changedKeys?: readonly (keyof SceneNode)[]
): void {
  r.textPreparationCache.deleteNode(nodeId, {
    keepShaping: changedKeys !== undefined && !changesShaping(changedKeys)
  })
  r.effectRasterCache.delete(nodeId)
  r.effectRasterCache.deleteDependencies(nodeId)
  for (const [ownerId, dependencyIds] of r.nodePictureCacheDependencies) {
    if (!dependencyIds.includes(nodeId)) continue
    r.nodePictureCache.get(ownerId)?.delete()
    r.nodePictureCache.delete(ownerId)
    r.nodePictureCacheGenerations.delete(ownerId)
    r.nodePictureCacheDependencies.delete(ownerId)
  }
  const pic = r.nodePictureCache.get(nodeId)
  if (pic) {
    pic.delete()
    r.nodePictureCache.delete(nodeId)
    r.nodePictureCacheGenerations.delete(nodeId)
    r.nodePictureCacheDependencies.delete(nodeId)
  }
  const subtree = r.subtreePictureCache.get(nodeId)
  if (subtree) {
    subtree.picture.delete()
    r.subtreePictureCache.delete(nodeId)
  }
}

export function flashNode(r: SkiaRenderer, nodeId: string): void {
  r._flashes.push({ nodeId, startTime: performance.now() })
}

export function aiMarkActive(r: SkiaRenderer, nodeIds: string[]): void {
  for (const id of nodeIds) r._aiActiveNodes.add(id)
}

export function aiMarkDone(r: SkiaRenderer, nodeIds: string[]): void {
  const now = performance.now()
  for (const id of nodeIds) {
    if (r._aiActiveNodes.delete(id)) {
      r._aiDoneFlashes.push({ nodeId: id, startTime: now })
    }
  }
}

export function aiFlashDone(r: SkiaRenderer, nodeIds: string[]): void {
  const now = performance.now()
  for (const id of nodeIds) {
    r._aiDoneFlashes.push({ nodeId: id, startTime: now })
  }
}

export function aiClearActive(r: SkiaRenderer): void {
  r._aiActiveNodes.clear()
}

export function aiClearAll(r: SkiaRenderer): void {
  r._aiActiveNodes.clear()
  r._aiDoneFlashes = []
}

/**
 * Drops flashes that have run their course. Drawing them used to do this; a renderer that never
 * draws, such as the offscreen one behind the DOM scene, still has to stop asking for frames.
 */
function pruneExpiredFlashes(r: SkiaRenderer, now: number): void {
  const flashTotal = FLASH_ATTACK_MS + FLASH_HOLD_MS + FLASH_RELEASE_MS
  if (r._flashes.some((flash) => now - flash.startTime > flashTotal))
    r._flashes = r._flashes.filter((flash) => now - flash.startTime <= flashTotal)
  if (r._aiDoneFlashes.some((flash) => now - flash.startTime > AI_DONE_DURATION_MS))
    r._aiDoneFlashes = r._aiDoneFlashes.filter(
      (flash) => now - flash.startTime <= AI_DONE_DURATION_MS
    )
}

export function hasActiveFlashes(r: SkiaRenderer): boolean {
  pruneExpiredFlashes(r, performance.now())
  return r._flashes.length > 0 || r._aiActiveNodes.size > 0 || r._aiDoneFlashes.length > 0
}
