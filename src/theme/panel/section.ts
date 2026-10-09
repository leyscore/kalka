/**
 * A titled group of properties. Sections are set apart by space rather than rules: a quiet label
 * row, then the fields, and an empty section is just its label and its add action.
 */
const panelSectionTheme = {
  slots: {
    root: 'px-3.5 text-surface data-[disabled]:opacity-60',
    header: 'flex h-[30px] min-w-0 items-center gap-1.5',
    title:
      'min-w-0 flex-1 cursor-default truncate border-0 bg-transparent p-0 text-left text-[11px] font-normal text-muted',
    actions:
      'flex h-7 w-[26px] shrink-0 items-center justify-end gap-0.5 [&_[data-slot=icon-button]]:size-6 [&_[data-slot=icon-button]]:rounded-md',
    body: 'min-w-0 pb-3 data-[state=closed]:hidden'
  }
}

export type PanelSectionTheme = typeof panelSectionTheme
export default panelSectionTheme
