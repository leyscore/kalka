import type { UserConfig } from '@commitlint/types'

export default {
  extends: ['@commitlint/config-conventional'],
  // PR titles must not bypass validation through Git's generated-message exceptions.
  defaultIgnores: process.env.COMMITLINT_PR_TITLE !== '1',
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'perf', 'docs', 'test', 'build', 'ci', 'chore']
    ],
    // Product names such as MCP, DOM/CSS, and Kiwi retain their casing.
    'subject-case': [0],
    'scope-case': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0]
  },
  ignores: [(message) => /^Release v\d+\.\d+\.\d+$/.test(message.split('\n')[0] ?? '')],
  helpUrl: 'https://github.com/open-pencil/open-pencil/blob/master/CONTRIBUTING.md#commit-messages'
} satisfies UserConfig
