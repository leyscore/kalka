import { call } from '../bridge'

export function exit(code = 0): Promise<void> {
  return call('process.exit', code)
}

export function relaunch(): Promise<void> {
  return call('process.relaunch')
}
