# Kalka Snapshot (browser extension)

A Chrome MV3 extension that inspects any web page and copies an element as Kalka layers or as HTML and CSS. `bun run --cwd extension build` writes the unpacked extension to `extension/dist`; load that folder from `chrome://extensions` with developer mode on.

- The toolbar popup (`extension/src/popup.ts`) and the Alt+Shift+K command (`extension/src/background.ts`) inject one script, `dist/main.js`, built as an IIFE from `extension/src/content/main.ts`; nothing runs on a page until the user asks, so the manifest keeps `activeTab` and no host permissions (`extension/manifest.json`).
- The inspector draws inside a closed-off shadow root and swallows the page's pointer events while it is open, so the page never sees a click meant for the inspector (`extension/src/content/overlay.ts`).
- A copy is the element's subtree with the computed styles written inline, inherited values only where they change and browser defaults left out, so Kalka's HTML paste rebuilds the same layers; keep it importable by `browserHTMLToSceneGraph` rather than adding a Kalka-only format (`extension/src/content/capture.ts`, `extension/tests/content.test.ts`).
- The extension imports nothing from the workspace packages: it ships to pages as one small script and must not pull the editor in.
