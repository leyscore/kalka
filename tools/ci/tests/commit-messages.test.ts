import { expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dir, '../../..')

async function lint(message: string, args: string[] = []) {
  const child = Bun.spawn([process.execPath, 'run', 'check:commits', '--verbose', ...args], {
    cwd: root,
    stdin: new Blob([message]),
    stdout: 'pipe',
    stderr: 'pipe'
  })
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text()
  ])
  return { code, output: stdout + stderr }
}

test.each([
  'fix: preserve selection',
  'refactor(MCP): preserve DOM/CSS and Kiwi names',
  'feat!: change the tool contract',
  `fix: explain the change\n\n${'Detailed rationale. '.repeat(12)}`,
  'Release v0.14.0',
  'Merge pull request #697 from open-pencil/mcp-v2-webmcp'
])('accepts supported commit: %s', async (message) => {
  const result = await lint(message)
  expect(result.output).toContain('found 0 problems')
  expect(result.code).toBe(0)
})

test.each([
  ['Fixed stuff', 'type-empty'],
  ['feature: add tools', 'type-enum'],
  ['fix:', 'subject-empty'],
  ['fix: trailing period.', 'subject-full-stop'],
  ['Release whatever', 'type-empty'],
  ['Bad subject\n\nRelease v0.14.0', 'type-empty']
])('rejects invalid commit: %s', async (message, rule) => {
  const result = await lint(message)
  expect(result.code).not.toBe(0)
  expect(result.output).toContain(rule)
  expect(result.output).toContain('CONTRIBUTING.md#commit-messages')
})

test('checks the full PR range while excluding existing base history', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'open-pencil-commitlint-'))
  async function git(...args: string[]) {
    const child = Bun.spawn(['git', ...args], { cwd: directory, stdout: 'pipe', stderr: 'pipe' })
    const [code, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text()
    ])
    if (code !== 0) throw new Error(stderr)
    return stdout.trim()
  }
  try {
    await git('init', '--quiet')
    await git('config', 'user.name', 'Commitlint test')
    await git('config', 'user.email', 'commitlint@example.invalid')
    await git('config', 'commit.gpgsign', 'false')
    await git('config', 'core.hooksPath', join(directory, 'no-hooks'))
    await git('commit', '--allow-empty', '-m', 'Legacy base message')
    const base = await git('rev-parse', 'HEAD')
    await git('commit', '--allow-empty', '-m', 'docs: explain setup')
    const args = [
      '--cwd',
      directory,
      '--config',
      join(root, 'commitlint.config.ts'),
      '--from',
      base,
      '--to',
      'HEAD'
    ]
    expect((await lint('', args)).code).toBe(0)
    await git('commit', '--allow-empty', '-m', 'Bad intermediate commit')
    await git('commit', '--allow-empty', '-m', 'fix: valid final commit')
    const result = await lint('', args)
    expect(result.code).not.toBe(0)
    expect(result.output).toContain('Bad intermediate commit')
    expect(result.output).not.toContain('Legacy base message')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
