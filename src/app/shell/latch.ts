import { readonly, ref, watch, type Ref } from 'vue'

/**
 * True from the first moment `source` is, and for good. A dialog whose code loads on demand mounts
 * once it first opens and stays mounted, so it closes with its animation and reopens at once.
 */
export function latch(source: () => boolean): Readonly<Ref<boolean>> {
  const latched = ref(source())
  if (!latched.value) {
    const stop = watch(source, (value) => {
      if (!value) return
      latched.value = true
      stop()
    })
  }
  return readonly(latched)
}
