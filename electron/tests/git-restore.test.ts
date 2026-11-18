import { afterEach, describe, expect, test } from 'bun:test'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { gitHandlers } from '../src/handlers/git-operations'

const context = {}
const folders: string[] = []

function repository(): string {
  const folder = mkdtempSync(join(tmpdir(), 'kalka-git-'))
  folders.push(folder)
  execFileSync('git', ['init', '-q'], { cwd: folder })
  execFileSync('git', ['config', 'user.name', 'Ada'], { cwd: folder })
  execFileSync('git', ['config', 'user.email', 'ada@example.com'], { cwd: folder })
  return folder
}

afterEach(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true })
})

describe('document versions in git', () => {
  test('a version names the agents in its trailers, and the history reads them back', async () => {
    const folder = repository()
    writeFileSync(join(folder, 'index.html'), '<h1>One</h1>')
    await gitHandlers.commit(
      context,
      join(folder, 'project.json'),
      'Hero\n\nKalka-Agent: Fern\nKalka-Agent: Oak'
    )
    const [version] = await gitHandlers.log(context, join(folder, 'project.json'), 5)
    expect(version).toMatchObject({ author: 'Ada', subject: 'Hero', agents: ['Fern', 'Oak'] })
  })

  test('restoring puts the files back as they were, removing ones added since', async () => {
    const folder = repository()
    const document = join(folder, 'project.json')
    writeFileSync(join(folder, 'index.html'), '<h1>One</h1>')
    await gitHandlers.commit(context, document, 'First')
    const [first] = await gitHandlers.log(context, document, 1)
    writeFileSync(join(folder, 'index.html'), '<h1>Two</h1>')
    writeFileSync(join(folder, 'about.html'), '<p>New</p>')
    await gitHandlers.commit(context, document, 'Second')

    await gitHandlers.restore(context, document, first.hash)
    expect(readFileSync(join(folder, 'index.html'), 'utf8')).toBe('<h1>One</h1>')
    expect(existsSync(join(folder, 'about.html'))).toBe(false)
    // Nothing is lost: the second version is still in the history.
    expect((await gitHandlers.log(context, document, 5)).map((item) => item.subject)).toEqual([
      'Second',
      'First'
    ])
  })

  test('refuses anything but a commit hash', async () => {
    const folder = repository()
    writeFileSync(join(folder, 'index.html'), 'x')
    await gitHandlers.commit(context, join(folder, 'project.json'), 'First')
    for (const hash of ['--orphan', 'HEAD~1', 'main..HEAD', ''])
      await expect(
        gitHandlers.restore(context, join(folder, 'project.json'), hash)
      ).rejects.toThrow()
  })
})
