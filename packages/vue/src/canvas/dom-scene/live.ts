import type { Editor, EditorState } from '@kalka/core/editor'
import { regenerateFillGeometry } from '@kalka/core/vector'
import { transformVectorNetwork, type SceneNode } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'

import type { DomSceneProjector } from './projector'

/**
 * Gestures the DOM scene draws before the graph has them: a layer being turned, at the angle the
 * handle holds, and a path being edited, from its live vertices.
 */
export class LiveEdits {
  private editState: EditorState['nodeEditState'] = null
  private editVersion = -1
  private rotationPreview: EditorState['rotationPreview'] = null

  constructor(
    private readonly editor: Editor,
    private readonly view: () => EditorState
  ) {}

  /** The fields each previewed layer draws with instead of its own, by layer id. */
  patches(): ReadonlyMap<string, Partial<SceneNode>> {
    const patches = new Map<string, Partial<SceneNode>>()
    const path = this.pathEditPatch()
    if (path) patches.set(path.id, path.patch)
    const turn = this.view().rotationPreview
    if (turn) patches.set(turn.nodeId, { ...patches.get(turn.nodeId), rotation: turn.angle })
    return patches
  }

  /** Marks the layers a gesture changed since the last frame, so the projector redraws them. */
  sync(projector: DomSceneProjector): void {
    const view = this.view()
    // Each step of a path edit redraws that path, and leaving the edit restores it. Vertices
    // move in place, so any repaint while editing counts as a step.
    const edit = view.nodeEditState ?? null
    if (edit !== this.editState || (edit && view.renderVersion !== this.editVersion)) {
      if (this.editState && this.editState !== edit)
        projector.nodeUpdated(this.editState.nodeId, {})
      if (edit) projector.nodeUpdated(edit.nodeId, {})
      this.editState = edit
      this.editVersion = view.renderVersion
    }
    // Each step of a turn redraws the layer at its new angle, and ending it restores the layer.
    const turn = view.rotationPreview ?? null
    if (turn !== this.rotationPreview) {
      if (this.rotationPreview && this.rotationPreview.nodeId !== turn?.nodeId)
        projector.nodeUpdated(this.rotationPreview.nodeId, {})
      if (turn) projector.nodeUpdated(turn.nodeId, {})
      this.rotationPreview = turn
    }
  }

  /** A path being edited is drawn from its live vertices, mapped back into its own frame. */
  private pathEditPatch(): { id: string; patch: Partial<SceneNode> } | null {
    const edit = this.view().nodeEditState
    if (!edit) return null
    const { graph } = this.editor
    const node = graph.getNode(edit.nodeId)
    const inverse = node ? Matrix.invert(getWorldMatrix(node, graph)) : null
    if (!node || !inverse) return null
    const vectorNetwork = transformVectorNetwork(inverse, {
      vertices: edit.vertices,
      segments: edit.segments,
      regions: edit.regions
    })
    return {
      id: edit.nodeId,
      patch: {
        vectorNetwork,
        fillGeometry: regenerateFillGeometry(vectorNetwork, node.fillGeometry),
        strokeGeometry: []
      }
    }
  }
}
