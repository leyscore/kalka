import { defineConfig } from '@playwright/test'

import baseConfig from './playwright.config'

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is required to run real LLM tests')
}

export default defineConfig(baseConfig, {
  projects: [
    {
      name: 'openpencil-real-llm',
      testDir: './tests/e2e',
      grep: /@real-llm/,
      fullyParallel: false
    }
  ]
})
