import { registerAll } from '../ipc'
import { gitHandlers } from './git-operations'

export { gitHandlers }

export function registerGitHandlers(): void {
  registerAll(gitHandlers, 'git')
}
