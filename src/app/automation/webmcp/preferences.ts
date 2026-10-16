import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

import { resolveWebMCPMode, type WebMCPMode } from './policy'

const storedMode = useLocalStorage('kalka:webmcp:mode', 'off')

export const webmcpMode = computed<WebMCPMode>({
  get: () => resolveWebMCPMode(storedMode.value),
  set: (mode) => {
    storedMode.value = resolveWebMCPMode(mode)
  }
})
