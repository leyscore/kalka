import { computed } from 'vue'
import type { ComputedRef } from 'vue'

import type { Editor } from '@kalka/core/editor'
import { FONT_WEIGHT_NAMES, weightToStyle } from '@kalka/core/text'
import type { SceneNode, TextDecoration } from '@kalka/scene-graph'

import { useHoverPreview } from '#vue/controls/node-preview/hover'
import type { UseTypographyOptions } from '#vue/controls/typography/use'
import { useSelectedNodeState } from '#vue/editor/selection-state/nodes'
import { useNodeFontStatus } from '#vue/shared/font-status/use'

type TextAlign = SceneNode['textAlignHorizontal']
type TextDirection = SceneNode['textDirection']
type TextVerticalAlign = SceneNode['textAlignVertical']
type TextCase = SceneNode['textCase']
type TextTruncation = SceneNode['textTruncation']

export const TYPOGRAPHY_WEIGHTS = Object.entries(FONT_WEIGHT_NAMES).map(([value, label]) => ({
  value: Number(value),
  label
}))

export function createTypographyState(editor: Editor) {
  // The shared copy of the selected layer, kept up to date field by field: a keystroke or a
  // resize changes only the fields the panel does not read, so the panel does not re-render.
  const { node } = useSelectedNodeState(editor)
  const { missingFonts, hasMissingFonts } = useNodeFontStatus(() => node.value)
  const fontFamily = computed(() => node.value?.fontFamily ?? '')
  const fontWeight = computed(() => node.value?.fontWeight ?? 400)
  const fontSize = computed(() => node.value?.fontSize ?? 16)
  const currentWeightLabel = computed(
    () => FONT_WEIGHT_NAMES[node.value?.fontWeight ?? 400] ?? 'Regular'
  )
  const activeFormatting = computed(() => {
    const n = node.value
    if (!n) return []
    const result: string[] = []
    if (n.fontWeight >= 700) result.push('bold')
    if (n.italic) result.push('italic')
    if (n.textDecoration === 'UNDERLINE') result.push('underline')
    if (n.textDecoration === 'STRIKETHROUGH') result.push('strikethrough')
    return result
  })

  return {
    node,
    fontFamily,
    fontWeight,
    fontSize,
    currentWeightLabel,
    activeFormatting,
    missingFonts,
    hasMissingFonts
  }
}

type TypographyActionOptions = {
  editor: Editor
  node: ComputedRef<SceneNode | null>
  currentWeightLabel: ComputedRef<string>
  activeFormatting: ComputedRef<string[]>
  options: UseTypographyOptions
}

export function createTypographyActions({
  editor,
  node,
  currentWeightLabel,
  activeFormatting,
  options
}: TypographyActionOptions) {
  let propBeforePreview:
    | { key: keyof SceneNode; value: SceneNode[keyof SceneNode]; textStyleId: string | null }
    | undefined

  async function doLoadFont(family: string, style: string) {
    await options.fontLoader?.load(family, style)
  }

  const hoverText = useHoverPreview(editor, 'Preview text')
  /** Counts hovers, so a font that loads after the pointer moved on is not shown. */
  let hover = 0

  /** Ends any hover preview, so a choice starts from the document's own value. */
  function endPreview() {
    hover++
    hoverText([], null)
  }

  async function setFamily(family: string) {
    endPreview()
    if (!node.value) return
    await doLoadFont(family, currentWeightLabel.value)
    editor.updateNodeWithUndo(node.value.id, { fontFamily: family }, 'Change font')
  }

  /**
   * Shows a family at once, in a fallback face while its own loads: a preview that waited for a
   * web font to download would come seconds after the pointer moved on.
   */
  function previewFamily(family: string | null) {
    hover++
    if (family === null || !node.value) {
      hoverText([], null)
      return
    }
    hoverText([node.value.id], { fontFamily: family })
    void doLoadFont(family, currentWeightLabel.value)
  }

  /** Shows text settings on the selection while they are hovered in a list; `null` takes them away. */
  function previewText(changes: Partial<SceneNode> | null) {
    hover++
    const id = node.value?.id
    hoverText(id ? [id] : [], changes)
  }

  /** Shows a weight once its font face has loaded, if it is still the one hovered. */
  async function previewWeight(weight: number | null) {
    const current = ++hover
    if (weight === null || !node.value) {
      hoverText([], null)
      return
    }
    const { id, fontFamily } = node.value
    await doLoadFont(fontFamily, weightToStyle(weight))
    if (current === hover) hoverText([id], { fontWeight: weight })
  }

  /**
   * Loads the weight's face before the layer takes it, as `setFamily` does: a layer naming a face
   * still on its way would read as a missing font for that moment.
   */
  async function setWeight(weight: number) {
    if (!node.value) return
    const { id, fontFamily } = node.value
    await doLoadFont(fontFamily, weightToStyle(weight))
    if (!editor.graph.getNode(id)) return
    editor.updateNodeWithUndo(id, { fontWeight: weight }, 'Change font weight')
  }

  function setAlign(align: TextAlign) {
    endPreview()
    if (!node.value) return
    editor.updateNodeWithUndo(
      node.value.id,
      { textAlignHorizontal: align },
      'Change text alignment'
    )
  }

  function setDirection(direction: TextDirection) {
    if (!node.value) return
    editor.updateNodeWithUndo(node.value.id, { textDirection: direction }, 'Change text direction')
  }

  function setVerticalAlign(align: TextVerticalAlign) {
    endPreview()
    if (!node.value) return
    editor.updateNodeWithUndo(
      node.value.id,
      { textAlignVertical: align },
      'Change vertical text alignment'
    )
  }

  function setTextCase(textCase: TextCase) {
    if (!node.value) return
    editor.updateNodeWithUndo(node.value.id, { textCase }, 'Change text case')
  }

  function setTruncation(textTruncation: TextTruncation) {
    if (!node.value) return
    editor.updateNodeWithUndo(node.value.id, { textTruncation }, 'Change text truncation')
  }

  function setFontFeature(tag: string, enabled: boolean) {
    if (!node.value) return
    const fontFeatures = node.value.fontFeatures.filter((feature) => feature.tag !== tag)
    fontFeatures.push({ tag, enabled })
    editor.updateNodeWithUndo(node.value.id, { fontFeatures }, `Change ${tag} feature`)
  }

  function toggleBold() {
    if (!node.value) return
    void setWeight(node.value.fontWeight >= 700 ? 400 : 700)
  }

  function toggleItalic() {
    if (!node.value) return
    editor.updateNodeWithUndo(node.value.id, { italic: !node.value.italic }, 'Toggle italic')
  }

  function toggleDecoration(deco: 'UNDERLINE' | 'STRIKETHROUGH') {
    if (!node.value) return
    const current = node.value.textDecoration
    editor.updateNodeWithUndo(
      node.value.id,
      { textDecoration: (current === deco ? 'NONE' : deco) as TextDecoration },
      `Toggle ${deco.toLowerCase()}`
    )
  }

  function onFormattingChange(values: string[]) {
    if (!node.value) return
    const prev = activeFormatting.value
    const added = values.filter((v) => !prev.includes(v))
    const removed = prev.filter((v) => !values.includes(v))
    for (const item of [...added, ...removed]) {
      if (item === 'bold') toggleBold()
      else if (item === 'italic') toggleItalic()
      else if (item === 'underline') toggleDecoration('UNDERLINE')
      else if (item === 'strikethrough') toggleDecoration('STRIKETHROUGH')
    }
  }

  function updateProp(key: keyof SceneNode, value: number | string | null) {
    if (!node.value) return
    if (!propBeforePreview || propBeforePreview.key !== key) {
      propBeforePreview = {
        key,
        value: node.value[key],
        textStyleId: node.value.textStyleId
      }
    }
    editor.updateNode(node.value.id, { [key]: value } as Partial<SceneNode>)
  }

  function commitProp(
    key: keyof SceneNode,
    _value: number | string | null,
    previous: number | string | null
  ) {
    if (!node.value) return
    const snapshot = propBeforePreview?.key === key ? propBeforePreview : undefined
    editor.commitNodeUpdate(
      node.value.id,
      {
        [key]: snapshot ? snapshot.value : previous,
        ...(snapshot ? { textStyleId: snapshot.textStyleId } : {})
      } as Partial<SceneNode>,
      `Change ${String(key)}`
    )
    propBeforePreview = undefined
  }

  return {
    setFamily,
    previewFamily,
    setWeight,
    previewWeight,
    previewText,
    setAlign,
    setDirection,
    setVerticalAlign,
    setTextCase,
    setTruncation,
    setFontFeature,
    toggleBold,
    toggleItalic,
    toggleDecoration,
    onFormattingChange,
    updateProp,
    commitProp
  }
}
