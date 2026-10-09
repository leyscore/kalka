export default {
  slots: {
    root: 'flex cursor-pointer items-start gap-3 rounded-[10px] border border-hairline bg-group px-3.5 py-3 text-xs text-surface transition-colors hover:bg-panel-field has-[[data-state=checked]]:border-accent/70 has-[[data-state=checked]]:bg-row-selected/40 focus-within:ring-2 focus-within:ring-accent/50 has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50',
    text: 'flex min-w-0 flex-col',
    label: 'font-medium',
    description: 'mt-0.5 text-[11px] text-muted'
  }
}
