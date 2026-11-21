// The toolbar popup: starts the inspector in the current tab and keeps the copy format.
const FORMAT_KEY = 'copyFormat'
const HINTS = {
  kalka: 'Select an element, then ⌘C. Paste it into any Kalka file with ⌘V.',
  html: 'Select an element, then ⌘C. Paste HTML and CSS into any editor, Kalka included.'
} as const

type Format = keyof typeof HINTS

function isFormat(value: unknown): value is Format {
  return value === 'kalka' || value === 'html'
}

const inspect = document.getElementById('inspect')
const error = document.getElementById('error')
const hint = document.getElementById('hint')
const radios = [...document.querySelectorAll<HTMLInputElement>('input[name="format"]')]

function showFormat(format: Format): void {
  for (const radio of radios) radio.checked = radio.value === format
  if (hint) hint.textContent = HINTS[format]
}

void chrome.storage.local.get(FORMAT_KEY).then((stored) => {
  const format = stored[FORMAT_KEY]
  showFormat(isFormat(format) ? format : 'kalka')
  return undefined
})

for (const radio of radios) {
  radio.addEventListener('change', () => {
    if (!isFormat(radio.value)) return
    showFormat(radio.value)
    void chrome.storage.local.set({ [FORMAT_KEY]: radio.value })
  })
}

inspect?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.id === undefined) return
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['main.js'] })
    window.close()
  } catch {
    if (error) error.hidden = false
  }
})
