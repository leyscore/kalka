import { expect, test } from 'bun:test'

import {
  classifyPaths,
  CODE_JOBS,
  DOCS_JOB,
  gateErrors,
  type ChangeScope,
  type JobStatus
} from '#ci/policy'

const documentation = [
  'README.md',
  'AGENTS.md',
  'CHANGELOG.md',
  'packages/docs/programmable/sdk/api/components/bindable-value.md',
  'packages/docs/public/logo.svg',
  'skills/open-pencil/SKILL.md',
  'skills/open-pencil/references/design-authoring.md',
  'openspec/proposal.md'
]
const code = [
  'src/app/ai/chat/system-prompt.md',
  'packages/core/src/design-jsx/reference/authoring.md',
  'packages/docs/.vitepress/config.ts',
  'packages/docs/demo.vue',
  'skills/open-pencil/scripts/create.ts',
  'package.json',
  'bun.lock',
  '.github/workflows/ci.yml',
  'new-domain/instructions.md',
  'src/editor.ts'
]

test.each(documentation)('docs-only path: %s', (path) => {
  expect(classifyPaths([path])).toBe('docs')
})
test.each(code)('code or unknown path: %s', (path) => {
  expect(classifyPaths([path])).toBe('code')
  expect(classifyPaths([...documentation, path])).toBe('code')
})
test('empty diffs fail safe to code checks', () => {
  expect(classifyPaths([])).toBe('code')
})
test('both sides of a rename affect classification', () => {
  expect(classifyPaths(['src/prompt.md', 'packages/docs/prompt.md'])).toBe('code')
  expect(classifyPaths(['packages/docs/old.md', 'packages/docs/new.md'])).toBe('docs')
})

function results(scope: ChangeScope): Record<string, JobStatus> {
  return {
    changes: { result: 'success', outputs: { scope } },
    [DOCS_JOB]: { result: scope === 'docs' ? 'success' : 'skipped' },
    ...Object.fromEntries(
      CODE_JOBS.map((job) => [job, { result: scope === 'code' ? 'success' : 'skipped' }])
    )
  }
}

test.each(['docs', 'code'] as const)(
  'accepts only appropriate successful checks for %s',
  (scope) => {
    expect(gateErrors(results(scope))).toEqual([])
  }
)

test.each(['failure', 'cancelled', 'skipped'] as const)(
  'rejects %s detection and required checks',
  (result) => {
    for (const scope of ['docs', 'code'] as const) {
      expect(gateErrors({ ...results(scope), changes: { result } })).not.toEqual([])
      for (const job of scope === 'docs' ? [DOCS_JOB] : CODE_JOBS) {
        expect(gateErrors({ ...results(scope), [job]: { result } })).not.toEqual([])
      }
    }
  }
)

test('missing jobs or outputs cannot pass', () => {
  expect(gateErrors({})).not.toEqual([])
  expect(gateErrors({ ...results('docs'), changes: { result: 'success' } })).not.toEqual([])
  expect(
    gateErrors({
      ...results('docs'),
      changes: { result: 'success', outputs: { scope: 'unknown' } }
    })
  ).not.toEqual([])
  for (const scope of ['docs', 'code'] as const) {
    for (const job of scope === 'docs' ? [DOCS_JOB] : CODE_JOBS) {
      const incomplete = Object.fromEntries(
        Object.entries(results(scope)).filter(([name]) => name !== job)
      )
      expect(gateErrors(incomplete)).not.toEqual([])
    }
  }
})

test('docs routing rejects unexpected execution of test suites', () => {
  for (const job of CODE_JOBS) {
    expect(gateErrors({ ...results('docs'), [job]: { result: 'success' } })).not.toEqual([])
  }
})
