import type { EditorPreparation, EditorPreparationProgress } from '@/app/editor/preparation/types'

export const preparationPhaseLabels = {
  reading: 'Reading document',
  decoding: 'Decoding Figma document',
  materializing: 'Preparing layers',
  'populating-page': 'Preparing page',
  'resolving-fonts': 'Resolving fonts',
  'resolving-fallbacks': 'Finalizing typography',
  layout: 'Computing layout',
  'preparing-render': 'Preparing canvas'
} satisfies Record<EditorPreparation['phase'], string>

/** What reading and decoding mean for an import that is not a Figma or Kalka document. */
const importPhaseLabels: Partial<
  Record<EditorPreparation['kind'], Partial<Record<EditorPreparation['phase'], string>>>
> = {
  'dom-import': { decoding: 'Reading the page' },
  'claude-design-import': {
    reading: 'Opening the Claude Design project',
    decoding: 'Drawing the Claude Design boards'
  }
}

export function preparationLabel(preparation: EditorPreparation | null): string {
  if (!preparation) return 'Loading…'
  return (
    importPhaseLabels[preparation.kind]?.[preparation.phase] ??
    preparationPhaseLabels[preparation.phase]
  )
}

export function preparationPercent(progress: EditorPreparationProgress | null): number | null {
  if (!progress || progress.total <= 0) return null
  return Math.min(100, Math.max(0, Math.round((progress.completed / progress.total) * 100)))
}
