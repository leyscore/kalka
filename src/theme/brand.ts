import { tv } from 'tailwind-variants'

export const brandMark = tv({ base: 'block size-4 shrink-0 object-contain' })

/** The page loader: a glass tile whose K fills with blue as the page gets ready. */
export const brandLoader = tv({
  slots: {
    tile: 'relative size-24 shrink-0 rounded-[22px] border border-(--loader-tile-border) bg-linear-145 from-white/30 to-white/5 shadow-[inset_0_1px_0_rgb(255_255_255/0.55),0_24px_60px_-18px_rgb(18_18_20/0.45),0_2px_8px_rgb(18_18_20/0.12)] backdrop-blur-xl backdrop-saturate-150 animate-in fade-in zoom-in-90 duration-500',
    glyph: 'absolute inset-[22%]',
    // The empty K: a faint cut in the glass.
    shell: 'absolute inset-0 bg-surface/12 mask-brand-k',
    vessel: 'absolute inset-0 overflow-hidden mask-brand-k',
    liquid:
      'absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-[#2448c4] to-[#4b74f0] shadow-[inset_0_2px_0_rgb(255_255_255/0.45)] transition-transform duration-500 ease-out motion-reduce:transition-none data-[indeterminate]:animate-liquid-fill motion-reduce:data-[indeterminate]:animate-none'
  }
})
