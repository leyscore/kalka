import { registerAll } from '../ipc'
import { gitBranchHandlers } from './branches'
import { gitHandlers } from './git-operations'

export { gitBranchHandlers, gitHandlers }

export function registerGitHandlers(): void {
  registerAll({ ...gitHandlers, ...gitBranchHandlers }, 'git')
}
