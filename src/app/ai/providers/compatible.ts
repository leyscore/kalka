import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'

import { IS_TAURI } from '@kalka/core/constants'

import type { ModelConfig, ModelProviderAdapter } from '@/app/ai/providers/types'
import type { FetchFunction } from '@/app/http/types'

// Anthropic omits CORS headers unless the caller opts in, so browser requests fail with an
// opaque "failed to fetch". The desktop build goes through tauriFetch and is not subject to CORS.
const BROWSER_ACCESS_HEADERS = { 'anthropic-dangerous-direct-browser-access': 'true' }

export type CompatibleEndpoint = string | ((config: ModelConfig) => string)

type OpenAICompatibleOptions = {
  baseURL?: CompatibleEndpoint
  mode?: 'default' | 'chat' | 'configurable'
}

type AnthropicCompatibleOptions = {
  baseURL?: CompatibleEndpoint
}

const CREDENTIAL_HEADERS = ['authorization', 'x-api-key']

/**
 * The API root of a compatible server. A bare server address, such as LM Studio's
 * `http://localhost:1234`, gets the `/v1` path these servers serve their API under; any other
 * path is kept as entered, without a trailing slash.
 */
export function compatibleBaseURL(baseURL: string): string {
  const trimmed = baseURL.trim()
  try {
    const url = new URL(trimmed)
    if (url.pathname === '/' && !url.search && !url.hash) return `${url.origin}/v1`
  } catch {
    return trimmed
  }
  return trimmed.replace(/\/+$/, '')
}

/**
 * A server on your own machine or network may need no key. Without one, requests leave out the
 * credential headers the SDKs always add rather than sending an empty one.
 */
function keylessFetch(apiKey: string, fetch: FetchFunction | undefined): FetchFunction | undefined {
  if (apiKey.trim()) return fetch
  return (input, init) => {
    const headers = new Headers(init?.headers)
    for (const name of CREDENTIAL_HEADERS) headers.delete(name)
    return (fetch ?? globalThis.fetch)(input, { ...init, headers })
  }
}

function resolveEndpoint(endpoint: CompatibleEndpoint | undefined, config: ModelConfig) {
  return typeof endpoint === 'function' ? endpoint(config) : endpoint
}

export function createOpenAICompatibleAdapter(
  options: OpenAICompatibleOptions = {}
): ModelProviderAdapter {
  return {
    create(config, runtime) {
      const provider = createOpenAI({
        apiKey: config.apiKey,
        baseURL: resolveEndpoint(options.baseURL, config),
        fetch: keylessFetch(config.apiKey, runtime.fetch)
      })
      const modelID = config.customModelID.trim() || config.modelID
      if (options.mode === 'chat') return provider.chat(modelID)
      if (options.mode === 'configurable') {
        return config.customAPIType === 'responses'
          ? provider.responses(modelID)
          : provider.chat(modelID)
      }
      return provider(modelID)
    }
  }
}

export function createAnthropicCompatibleAdapter(
  options: AnthropicCompatibleOptions = {}
): ModelProviderAdapter {
  return {
    create(config, runtime) {
      const provider = createAnthropic({
        apiKey: config.apiKey,
        baseURL: resolveEndpoint(options.baseURL, config),
        fetch: keylessFetch(config.apiKey, runtime.fetch),
        headers: IS_TAURI ? undefined : BROWSER_ACCESS_HEADERS
      })
      return provider(config.customModelID.trim() || config.modelID)
    }
  }
}
