import { tv } from 'tailwind-variants'

import { floatingSurface } from '@/theme/overlay'

/**
 * The agent's place in the editor: a field at the end of the toolbar, and the conversation in a
 * panel that rises above it, so the canvas stays in view while the agent works. In a narrow
 * canvas the field keeps its icon alone, so the toolbar still fits between the side panels.
 */
export const agentDock = tv({
  slots: {
    tablist: 'flex items-center',
    field:
      'flex size-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-track @[620px]/canvas:w-52 @[620px]/canvas:justify-start @[620px]/canvas:px-2.5 text-left text-xs text-muted outline-none transition-colors duration-150 hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-[state=active]:text-surface',
    fieldIcon: 'size-4 shrink-0',
    fieldLabel: 'hidden min-w-0 flex-1 truncate @[620px]/canvas:block',
    panel: [
      'absolute bottom-[72px] left-1/2 z-20 flex h-[min(380px,calc(100%-96px))] w-[min(520px,calc(100%-32px))] -translate-x-1/2 flex-col overflow-hidden',
      floatingSurface
    ]
  }
})
