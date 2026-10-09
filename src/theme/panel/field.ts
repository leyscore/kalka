export const panelFieldBase =
  'h-6 min-w-0 rounded-md border border-transparent bg-panel-field text-surface outline-none transition-[background-color,border-color] duration-100 hover:bg-panel-field-hover focus:border-panel-focus focus:bg-panel-field-hover focus-visible:border-panel-focus focus-within:border-panel-focus focus-within:bg-panel-field-hover disabled:cursor-not-allowed disabled:text-muted disabled:opacity-60'

export const panelFieldState = {
  idle: '',
  mixed: 'text-muted placeholder:text-muted',
  bound: 'text-component',
  invalid: 'border-error focus:border-error focus-visible:border-error'
} as const

export const panelIconButtonBase =
  'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent text-muted outline-none transition-colors duration-100 hover:bg-hover hover:text-surface focus-visible:border-panel-focus disabled:cursor-not-allowed disabled:opacity-50'
