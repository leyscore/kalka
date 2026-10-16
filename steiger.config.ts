import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

import { kalkaArchitecturePlugin } from './tools/checks/architecture/src/steiger-rules/index.ts'

// Kalka is not laid out as canonical Feature-Sliced Design layers.
// Keep Steiger focused on project-specific architecture boundaries instead of
// enabling fsd.configs.recommended, which treats src/ and packages/ as FSD layer typos.
export default defineConfig([
  fsd.plugin,
  kalkaArchitecturePlugin,
  {
    ignores: [
      '.claude/**',
      'node_modules/**',
      'dist/**',
      'public/**',
      'scratch/**',
      'demo-recordings/**'
    ]
  },
  {
    rules: {
      'kalka/prefer-domain-folders-over-filename-prefixes': 'error',
      'kalka/strict-test-file-placement': 'error',
      'kalka/no-engine-only-assertions-in-e2e': 'error',
      'kalka/no-e2e-imports-in-engine-tests': 'error',
      'kalka/no-root-markdown-clutter': 'error',
      'kalka/no-prototype-or-generated-imports': 'error',
      'kalka/no-property-panel-imports-in-canvas': 'error',
      'kalka/no-app-imports-in-workspace-packages': 'error',
      'kalka/no-package-internals-in-app': 'error',
      'kalka/no-foreign-package-local-aliases': 'error',
      'kalka/no-app-imports-components-or-views': 'error',
      'kalka/no-components-import-views': 'error',
      'kalka/no-views-imported-outside-entry': 'error',
      'kalka/no-non-ui-imports-in-shared-ui': 'error',
      'kalka/no-app-imports-in-shared-ui': 'error',
      'kalka/no-property-panel-internals-outside-panel': 'error',
      'kalka/no-production-test-ids-in-shared-layers': 'error',
      'kalka/no-native-title-attributes-in-vue': 'error',
      'kalka/no-ui-imports-in-core': 'error',
      'kalka/scripts-are-entrypoint-shims': 'error',
      'kalka/strict-tools-layout': 'error'
    }
  }
])
