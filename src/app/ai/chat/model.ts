import type { LanguageModel } from 'ai'

import { modelProviderAdapter } from '@/app/ai/providers/registry'
import type { ModelConfig } from '@/app/ai/providers/types'
import type { FetchFunction } from '@/app/http/types'
import { isTauri } from '@/app/tauri/env'
import { createTauriFetch } from '@/app/tauri/http'

export type { ModelConfig } from '@/app/ai/providers/types'

export function resolveLanguageModelID(
  config: Pick<ModelConfig, 'providerID' | 'modelID' | 'customModelID'>
): string {
  if (
    config.providerID === 'openrouter' ||
    config.providerID === 'openai-compatible' ||
    config.providerID === 'anthropic-compatible'
  ) {
    return config.customModelID.trim() || config.modelID
  }
  return config.modelID
}

/**
 * How long a model may stay silent before its request is dropped. A local model can take
 * minutes to read a long prompt before it writes anything, so this is generous.
 */
const MODEL_IDLE_TIMEOUT_MS = 300_000

// Replies stream through the desktop bridge as the model writes them, with no limit on their
// total length; only a server that stops answering ends one.
const streamingDesktopFetch = createTauriFetch({ stream: true, timeoutMs: MODEL_IDLE_TIMEOUT_MS })

function desktopFetch(): FetchFunction | undefined {
  return isTauri() ? streamingDesktopFetch : undefined
}

export function createLanguageModel(config: ModelConfig): LanguageModel {
  return modelProviderAdapter(config.providerID).create(config, { fetch: desktopFetch() })
}
