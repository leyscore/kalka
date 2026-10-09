import { tv } from 'tailwind-variants'

/**
 * Tabs across the top of the right panel, with a pill that slides to the active tab. A row wide
 * enough for every label shows labels alone; a narrower one drops them together for icons, and
 * labels stay available to screen readers. The design check keeps its icon while it reports
 * problems, since the icon carries their severity. The row clips horizontally rather than
 * scrolls, so focusing a control never shifts the panel.
 */
export const propertiesTabs = tv({
  slots: {
    list: '@container/tabs flex shrink-0 items-center gap-0.5 overflow-x-clip border-b border-hairline px-2 pb-2',
    trigger:
      'relative flex min-h-7 shrink-0 items-center gap-1 rounded-[7px] px-2.5 text-xs text-muted outline-none transition-colors duration-150 hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-[state=active]:font-semibold data-[state=active]:text-surface',
    icon: 'size-3 shrink-0 data-[severity=error]:text-issue-error data-[severity=warning]:text-issue-warning @[250px]/tabs:not-data-[severity]:hidden',
    label: 'sr-only @[250px]/tabs:not-sr-only'
  }
})
