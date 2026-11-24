import { tv } from 'tailwind-variants'

/** Stars fill with the level and shift from cool to warm as the model thinks harder. */
export const chatThinkingTheme = tv({
  slots: {
    meter:
      'inline-flex h-3 shrink-0 items-center gap-px text-muted data-[level=high]:text-violet-400 data-[level=low]:text-sky-400 data-[level=medium]:text-primary data-[level=minimal]:text-sky-300 data-[level=xhigh]:text-fuchsia-400',
    bar: 'size-[9px] bg-current mask-sky-star data-[filled=false]:bg-muted/30',
    trigger: 'flex shrink-0 items-center',
    /** Narrow composers show only the meter, leaving the width to the model name. */
    label: 'hidden truncate @[16rem]:inline',
    option: 'ml-auto pl-3'
  }
})
