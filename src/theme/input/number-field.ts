import { panelFieldBase } from '../panel/field'

/** A property's number: a quiet prefix, such as X or W, before a monospaced value. */
const numberFieldTheme = {
  slots: {
    root: [
      panelFieldBase,
      'group flex min-h-7 flex-1 cursor-ew-resize items-center text-xs tabular-nums data-[disabled]:cursor-auto data-[editing]:cursor-auto'
    ],
    leading:
      'flex shrink-0 items-center justify-center self-stretch pr-1.5 pl-[9px] text-faint select-none empty:pr-0 [&>*]:pointer-events-none',
    field:
      'min-w-0 flex-1 cursor-text border-none bg-transparent pr-1.5 font-mono text-xs text-surface outline-none',
    display: 'flex min-w-0 flex-1 items-center overflow-hidden font-mono text-xs select-none',
    mixed: 'flex-1 text-muted',
    value: 'min-w-0 flex-1 truncate text-surface',
    trailing: 'flex shrink-0 items-center self-stretch',
    suffix: 'shrink-0 pr-2 text-faint'
  },
  variants: {
    /** A trailing control, such as the variable button, brings its own spacing after the unit. */
    suffix: {
      true: { display: 'pr-0', suffix: 'pr-0.5' },
      false: { display: 'pr-2' }
    }
  }
}

export type NumberFieldTheme = typeof numberFieldTheme
export default numberFieldTheme
