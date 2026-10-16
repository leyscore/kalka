import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ensureBrandAssets } from '@kalka/brand-tools'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

import { rootThemeConfig } from './root-theme.ts'
import { BASE, applyPageSeo, siteHead } from './seo.ts'

await ensureBrandAssets(['docs'])

const configDir = dirname(fileURLToPath(import.meta.url))
const docsRoot = dirname(configDir)
const packagesRoot = dirname(docsRoot)
const repoRoot = dirname(packagesRoot)
const fastBuild = process.env.OPENPENCIL_DOCS_FAST_BUILD === '1'

const llmsPlugin = llmstxt({
  domain: BASE,
  generateLLMsTxt: !fastBuild,
  generateLLMsFullTxt: !fastBuild,
  generateLLMFriendlyDocsForEachPage: !fastBuild,
  injectLLMHint: false,
  customTemplateVariables: {
    title: 'Kalka developer docs',
    description:
      'Developer documentation for Kalka, a design editor whose canvas is real HTML and CSS: architecture, scene graph, CLI, MCP server, Vue SDK and file formats.',
    details: `Use this file as the compact map for agents. For complete Markdown content, fetch ${BASE}/llms-full.txt.`
  }
})

export default defineConfig({
  title: 'Kalka developer docs',
  description:
    'Developer documentation for Kalka, a design editor whose canvas is real HTML and CSS.',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',

  sitemap: {
    hostname: BASE
  },

  head: siteHead,

  transformPageData: applyPageSeo,

  markdown: {
    codeTransformers: [
      transformerTwoslash({
        typesCache: createFileSystemTypesCache({
          dir: resolve(configDir, 'cache/twoslash')
        }),
        twoslashOptions: {
          compilerOptions: {
            baseUrl: repoRoot,
            paths: {
              '@kalka/vue': ['packages/vue/src/index.ts'],
              '#vue/*': ['packages/vue/src/*']
            }
          }
        }
      })
    ]
  },

  vite: {
    resolve: {
      alias: {
        '#docs': configDir,
        '#docs-api': resolve(docsRoot, 'programmable/sdk/api'),
        '#vue': resolve(packagesRoot, 'vue/src')
      }
    },
    plugins: [tailwindcss(), llmsPlugin]
  },

  themeConfig: rootThemeConfig()
})
