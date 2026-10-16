#!/usr/bin/env bun
import { resolve } from 'node:path'

import { EN, EN_PROG } from '#docs-config/labels'
import { sdkSidebar } from '#docs-config/sdk-sidebar'
import { developmentSidebar, programmableSidebar, referenceSidebar } from '#docs-config/sidebars'

import { resolveWorkspaceRoot } from '@kalka/package-artifacts-tools'

import { checkGuideMap } from './guides'
import { checkDocsIntegrity } from './integrity'

interface SidebarItem {
  items?: SidebarItem[]
  link?: string
}

function sidebarLinks(items: SidebarItem[]): string[] {
  return items.flatMap((item) => [
    ...(item.link ? [item.link] : []),
    ...(item.items ? sidebarLinks(item.items) : [])
  ])
}

const repoRoot = await resolveWorkspaceRoot(import.meta.dir)
const docsRoot = resolve(repoRoot, 'packages/docs')
const result = checkDocsIntegrity({
  docsRoot,
  // The site is English only; translations of the product live on kalka.design.
  localePrefixes: [],
  redirectsPath: resolve(docsRoot, 'public/_redirects'),
  sidebarLinks: sidebarLinks([
    ...programmableSidebar('', EN_PROG),
    ...sdkSidebar(''),
    ...referenceSidebar('', 'Reference', EN),
    ...developmentSidebar('', 'Development', EN)
  ])
})

const guides = checkGuideMap({ repoRoot })
const errors = [...result.errors, ...guides.errors]

if (errors.length > 0) {
  console.error('\nDocumentation integrity check failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Guide map check passed for ${guides.guides.length} AGENTS.md guides.`)

console.log(
  `Documentation integrity check passed for ${result.markdownFiles.length} Markdown files.`
)
