import { uniq } from 'es-toolkit/array'
import { computed, ref, shallowRef, watch, type Ref } from 'vue'

import type { DocumentFontStatus, FontLoadedSource } from '@kalka/core/text'
import { DEFAULT_FONT_FAMILY, type SceneNode } from '@kalka/scene-graph'
import { useEditorEvent } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { addCatalogueFont, catalogueFamilies, type CatalogueFont } from '@/app/editor/fonts/project'

/** Where a face drew from that the document does not carry: the computer, or the document. */
const KEPT_SOURCES = new Set<FontLoadedSource>(['project', 'bundled', 'fallback', 'registered'])

/**
 * The fonts a page names that the document does not carry, and which of them the free catalogue
 * has: those can be added in one click, so the design draws as intended offline and for anyone
 * who opens it; the rest can be replaced with a family that is there.
 */
export function useMissingDocumentFonts(status: Ref<DocumentFontStatus>) {
  const editor = useEditorStore()
  const revision = ref(0)
  useEditorEvent('fonts:changed', () => revision.value++)
  useEditorEvent('graph:replaced', () => {
    revision.value++
    dismissed.value = false
  })

  /** Families the catalogue was asked about, and what it has of them. */
  const checked = shallowRef(new Set<string>())
  const catalogue = shallowRef(new Map<string, CatalogueFont>())
  const dismissed = ref(false)
  const adding = ref(false)
  const failed = ref<string | null>(null)

  /** Families the page uses that draw from no file the document or Kalka keeps. */
  const unkept = computed(() => {
    void revision.value
    return uniq(
      status.value.faces
        .filter(
          (face) =>
            face.family !== DEFAULT_FONT_FAMILY &&
            !editor.graph.fonts.has(face.family) &&
            !(face.source && KEPT_SOURCES.has(face.source))
        )
        .map((face) => face.family)
    )
  })

  watch(
    unkept,
    async (families) => {
      const unchecked = families.filter((family) => !checked.value.has(family))
      if (unchecked.length === 0) return
      checked.value = new Set([...checked.value, ...unchecked])
      const found = await catalogueFamilies(unchecked)
      if (found.size > 0) catalogue.value = new Map([...catalogue.value, ...found])
    },
    { immediate: true }
  )

  /** Families to add in one click. */
  const addable = computed(() => unkept.value.filter((family) => catalogue.value.has(family)))

  /** Families that draw with another face and that the catalogue does not have. */
  const unavailable = computed(() =>
    uniq(
      status.value.issues
        .map((issue) => issue.family)
        .filter((family) => checked.value.has(family) && !catalogue.value.has(family))
    )
  )

  const offered = computed(() => (dismissed.value ? [] : addable.value))

  async function addAll(): Promise<boolean> {
    if (adding.value) return false
    adding.value = true
    failed.value = null
    try {
      for (const family of addable.value) {
        const font = catalogue.value.get(family)
        if (font) await addCatalogueFont(editor, font)
      }
      return true
    } catch (error) {
      failed.value = error instanceof Error ? error.message : String(error)
      return false
    } finally {
      adding.value = false
    }
  }

  /** Sets every text of the page in `from` in `to` instead, as one step to undo. */
  function replace(from: string, to: string) {
    if (from === to) return
    const ids = status.value.faces
      .filter((face) => face.family === from)
      .flatMap((face) => face.nodeIds)
    editor.undo.runBatch('Replace font', () => {
      for (const id of uniq(ids)) {
        const node = editor.graph.getNode(id)
        if (node?.type !== 'TEXT') continue
        const changes: Partial<SceneNode> = {}
        if (node.fontFamily === from) changes.fontFamily = to
        if (node.styleRuns.some((run) => run.style.fontFamily === from))
          changes.styleRuns = node.styleRuns.map((run) =>
            run.style.fontFamily === from
              ? { ...run, style: { ...run.style, fontFamily: to } }
              : run
          )
        if (Object.keys(changes).length > 0) editor.updateNodeWithUndo(id, changes, 'Replace font')
      }
    })
  }

  return {
    offered,
    unavailable,
    adding,
    failed,
    addAll,
    replace,
    dismiss: () => {
      dismissed.value = true
    }
  }
}
