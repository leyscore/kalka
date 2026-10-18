import { onMounted } from 'vue'

import { mcpRootDirectory } from '@/app/automation/mcp/preferences'
import {
  ensureMCPRuntime,
  refreshMCPRuntime,
  restartMCPRuntime
} from '@/app/automation/mcp/runtime'
import { isTauri } from '@/app/tauri/env'

export function useMCPSettings() {
  onMounted(() => {
    // A server still waiting for the app to be idle starts now, so its status is real.
    void ensureMCPRuntime().then(() => refreshMCPRuntime())
  })

  function restart(): void {
    void restartMCPRuntime()
  }

  async function chooseRootDirectory(): Promise<void> {
    if (!isTauri()) return

    const { open } = await import('@tauri-apps/plugin-dialog')
    const directory = await open({ directory: true, multiple: false })
    if (typeof directory === 'string') mcpRootDirectory.value = directory
  }

  return { restart, chooseRootDirectory }
}
