import { computed } from 'vue'

import { recoveryEnabled } from '@/app/document/recovery/preferences'
import { isRecoveryStoreMemoryFallback } from '@/app/document/recovery/store'

/**
 * Whether drafts outlive this page: recovery keeps them in this browser's storage. Then, as in
 * Figma, a draft's tab closes without asking, and the draft stays on Home.
 */
export const draftsPersist = computed(
  () => recoveryEnabled.value && !isRecoveryStoreMemoryFallback()
)
