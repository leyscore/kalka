import { onScopeDispose } from 'vue'

import type { EditorEventName, EditorEvents } from '@kalka/core/editor'

import { useEditor } from '#vue/editor/context'

export function useEditorEvent<K extends EditorEventName>(event: K, handler: EditorEvents[K]) {
  const editor = useEditor()
  const stop = editor.onEditorEvent(event, handler)
  onScopeDispose(stop)
  return stop
}
