import { afterEach, describe, expect, test } from 'bun:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { gitBranchHandlers } from '../src/handlers/branches'
import { gitHandlers } from '../src/handlers/git-operations'

const context = {}
const folders: string[] = []

/** A Kalka folder in a repository with a first version on `main`. */
async function folder(): Promise<string> {
  const path = mkdtempSync(join(tmpdir(), 'kalka-branches-'))
  folders.push(path)
  execFileSync('git', ['init', '-q', '--initial-branch=main'], { cwd: path })
  execFileSync('git', ['config', 'user.name', 'Ada'], { cwd: path })
  execFileSync('git', ['config', 'user.email', 'ada@example.com'], { cwd: path })
  writeFileSync(join(path, 'index.html'), '<h1>Home</h1>\n')
  writeFileSync(join(path, 'about.html'), '<p>About</p>\n')
  await gitHandlers.commit(context, path, 'First', undefined)
  return path
}

afterEach(() => {
  for (const path of folders.splice(0)) rmSync(path, { recursive: true, force: true })
})

describe('branches of a Kalka folder', () => {
  test('a branch is made, listed, reviewed and merged back as one version', async () => {
    const path = await folder()
    await gitBranchHandlers.createBranch(context, path, 'hero')
    expect(await gitBranchHandlers.branches(context, path)).toEqual({
      current: 'hero',
      branches: ['hero', 'main']
    })
    writeFileSync(join(path, 'index.html'), '<h1>Bigger home</h1>\n')
    await gitHandlers.commit(context, path, 'Hero', undefined)

    await gitBranchHandlers.switchBranch(context, path, 'main')
    expect(readFileSync(join(path, 'index.html'), 'utf8')).toBe('<h1>Home</h1>\n')
    expect(await gitBranchHandlers.branchChanges(context, path, 'hero')).toEqual([
      { path: 'index.html', status: 'M' }
    ])

    await gitBranchHandlers.merge(context, path, 'hero')
    expect(readFileSync(join(path, 'index.html'), 'utf8')).toBe('<h1>Bigger home</h1>\n')
    await gitBranchHandlers.deleteBranch(context, path, 'hero')
    expect((await gitBranchHandlers.branches(context, path)).branches).toEqual(['main'])
  })

  test('changes that meet are not merged, and the folder stays as it was', async () => {
    const path = await folder()
    await gitBranchHandlers.createBranch(context, path, 'copy')
    writeFileSync(join(path, 'about.html'), '<p>About us</p>\n')
    await gitHandlers.commit(context, path, 'Copy', undefined)
    await gitBranchHandlers.switchBranch(context, path, 'main')
    writeFileSync(join(path, 'about.html'), '<p>About the team</p>\n')
    await gitHandlers.commit(context, path, 'Team', undefined)

    await expect(gitBranchHandlers.merge(context, path, 'copy')).rejects.toThrow('about.html')
    expect(readFileSync(join(path, 'about.html'), 'utf8')).toBe('<p>About the team</p>\n')
    const status = await gitHandlers.status(context, path)
    expect(status?.files).toEqual([])
  })

  test('refuses names git would read as options or reject', async () => {
    const path = await folder()
    for (const name of ['--orphan', '', 'a..b', 'has space'])
      await expect(gitBranchHandlers.createBranch(context, path, name)).rejects.toThrow()
    await expect(gitBranchHandlers.switchBranch(context, path, 'missing')).rejects.toThrow()
  })
})
