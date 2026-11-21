// The shortcut (Alt+Shift+K by default) turns the inspector on or off in the current tab, as
// the popup's button does. The inspector is injected only then, never into every page.
export async function toggleInspector(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({ target: { tabId }, files: ['main.js'] })
}

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== 'inspect' || tab?.id === undefined) return
  toggleInspector(tab.id).catch((error: unknown) => {
    console.warn('[Kalka Snapshot] This page cannot be inspected:', error)
  })
})
