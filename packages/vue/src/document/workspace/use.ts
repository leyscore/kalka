import { useEventListener, useIntervalFn } from '@vueuse/core'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  shallowRef,
  type Directive,
  type Ref
} from 'vue'

import { IS_BROWSER } from '@open-pencil/core/constants'

export type DocumentWorkspaceItem = {
  id: string
  name: string
  updatedAt: string
}

export interface DocumentWorkspaceSource<Item extends DocumentWorkspaceItem> {
  refresh(): Promise<Item[]>
  loadPreview(id: string): Promise<Uint8Array | null>
  subscribe?(listener: () => void): () => void
}

export type UseDocumentWorkspaceOptions<Item extends DocumentWorkspaceItem> = {
  source: DocumentWorkspaceSource<Item>
  refreshInterval?: number
  refreshOnFocus?: boolean
  refreshOnReconnect?: boolean
  previewConcurrency?: number
  previewMimeType?: string
}

export function useDocumentWorkspace<Item extends DocumentWorkspaceItem>(
  options: UseDocumentWorkspaceOptions<Item>
) {
  const documents = shallowRef<Item[]>([])
  const loading = ref(false)
  const error = shallowRef<unknown>(null)
  const lastRefreshedAt = shallowRef<Date | null>(null)
  const previewUrls = ref<Record<string, string>>({})
  const previewCleanups = new WeakMap<Element, () => void>()
  const previewGenerations = new Map<string, number>()
  const previewQueue: string[] = []
  const queued = new Set<string>()
  const activePreviews = new Set<string>()
  const concurrency = Math.max(1, Math.floor(options.previewConcurrency ?? 6))
  let refreshPromise: Promise<void> | null = null
  let refreshQueued = false
  let disposed = false

  function removePreviewURL(id: string): void {
    previewGenerations.set(id, (previewGenerations.get(id) ?? 0) + 1)
    const url = previewUrls.value[id]
    if (!url) return
    URL.revokeObjectURL(url)
    previewUrls.value = Object.fromEntries(
      Object.entries(previewUrls.value).filter(([previewId]) => previewId !== id)
    )
  }

  function reconcilePreviewUrls(items: readonly Item[]): void {
    const previousItems = new Map(documents.value.map((item) => [item.id, item.updatedAt]))
    const currentItems = new Map(items.map((item) => [item.id, item.updatedAt]))
    for (const id of Object.keys(previewUrls.value)) {
      if (previousItems.get(id) !== currentItems.get(id)) removePreviewURL(id)
    }
  }

  function clearPreviews(): void {
    const ids = new Set([
      ...Object.keys(previewUrls.value),
      ...activePreviews,
      ...queued,
      ...previewGenerations.keys()
    ])
    for (const id of ids) removePreviewURL(id)
    previewQueue.length = 0
    queued.clear()
  }

  function replacePreviewURL(id: string, bytes: Uint8Array): void {
    if (disposed) return
    const previous = previewUrls.value[id]
    if (previous) URL.revokeObjectURL(previous)
    const blobBytes = Uint8Array.from(bytes)
    previewUrls.value = {
      ...previewUrls.value,
      [id]: URL.createObjectURL(
        new Blob([blobBytes.buffer], { type: options.previewMimeType ?? 'image/png' })
      )
    }
  }

  function drainPreviewQueue(): void {
    while (activePreviews.size < concurrency) {
      const id = previewQueue.shift()
      if (!id) break
      queued.delete(id)
      if (activePreviews.has(id) || previewUrls.value[id]) continue
      activePreviews.add(id)
      const generation = previewGenerations.get(id) ?? 0
      void options.source
        .loadPreview(id)
        .then((bytes) => {
          if (bytes?.byteLength && generation === (previewGenerations.get(id) ?? 0)) {
            replacePreviewURL(id, bytes)
          }
          return undefined
        })
        .catch(() => null)
        .finally(() => {
          activePreviews.delete(id)
          drainPreviewQueue()
        })
    }
  }

  function loadPreview(id: string): void {
    if (previewUrls.value[id] || activePreviews.has(id) || queued.has(id)) return
    queued.add(id)
    previewQueue.push(id)
    drainPreviewQueue()
  }

  function previewURL(id: string): string | null {
    return previewUrls.value[id] ?? null
  }

  function observePreview(element: Element | null, id: string): () => void {
    if (!element || typeof IntersectionObserver === 'undefined') {
      loadPreview(id)
      return () => undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadPreview(id)
          observer.disconnect()
        }
      },
      { rootMargin: '240px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }

  function stopObservingPreview(element: Element): void {
    previewCleanups.get(element)?.()
    previewCleanups.delete(element)
  }

  const previewDirective: Directive<Element, string> = {
    mounted(element, binding) {
      previewCleanups.set(element, observePreview(element, binding.value))
    },
    updated(element, binding) {
      if (binding.value === binding.oldValue) return
      stopObservingPreview(element)
      previewCleanups.set(element, observePreview(element, binding.value))
    },
    unmounted(element) {
      stopObservingPreview(element)
    }
  }

  function refresh(): Promise<void> {
    if (refreshPromise) return refreshPromise
    loading.value = true
    error.value = null
    const nextRefresh = options.source
      .refresh()
      .then((items) => {
        if (!disposed) {
          reconcilePreviewUrls(items)
          documents.value = items
          lastRefreshedAt.value = new Date()
        }
        return undefined
      })
      .catch((reason: unknown) => {
        if (!disposed) error.value = reason
      })
      .finally(() => {
        loading.value = false
        refreshPromise = null
        if (refreshQueued && !disposed) {
          refreshQueued = false
          void refresh()
        }
      })
    refreshPromise = nextRefresh
    return nextRefresh
  }

  function invalidate(): Promise<void> {
    if (!refreshPromise) return refresh()
    refreshQueued = true
    return refreshPromise
  }

  if (options.refreshOnFocus !== false && IS_BROWSER) {
    useEventListener(window, 'focus', () => void invalidate())
  }
  if (options.refreshOnReconnect !== false && IS_BROWSER) {
    useEventListener(window, 'online', () => void invalidate())
  }
  if (options.refreshInterval && options.refreshInterval > 0) {
    useIntervalFn(
      () => {
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          void invalidate()
        }
      },
      options.refreshInterval,
      { immediate: false }
    )
  }

  let unsubscribeSource: (() => void) | null = null
  onMounted(() => {
    unsubscribeSource = options.source.subscribe?.(() => void invalidate()) ?? null
    void refresh()
  })
  onBeforeUnmount(() => {
    unsubscribeSource?.()
    disposed = true
    clearPreviews()
  })

  return {
    documents: readonly(documents) as Readonly<Ref<readonly Item[]>>,
    loading: readonly(loading),
    error: readonly(error),
    lastRefreshedAt: readonly(lastRefreshedAt),
    previewUrls: readonly(previewUrls),
    hasDocuments: computed(() => documents.value.length > 0),
    refresh,
    invalidate,
    clearPreviews,
    loadPreview,
    observePreview,
    previewDirective,
    previewURL
  }
}
