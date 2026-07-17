export default {
  slots: {
    root: 'flex h-control min-w-0 flex-1 items-center overflow-hidden rounded-panel border border-border bg-input shadow-panel-field',
    preview: 'flex shrink-0 items-center pl-0.5',
    value: 'flex min-w-0 flex-1 items-center px-1.5',
    divider: 'h-4 w-px shrink-0 bg-border',
    opacity: 'h-full w-14 shrink-0',
    binding: 'flex shrink-0 items-center pr-0.5'
  }
} as const
