# User sessions

Sessions a person plays in the real interface, the way someone opening Kalka for the first time or arriving from Figma would. They find what automated specs cannot: a control nobody notices, a tool that will not let go, a gesture that works differently from Figma, a flash on one platform. They do not replace `tests/e2e`; a finding that can be pinned down becomes a spec there once it is fixed.

## What a session is

Each file is one session: who plays it, where it starts, and a handful of missions written as goals ("put the button flush with the artboard's right edge"), never as clicks. The player works out how to do it, as a user would. Under each mission, "Watch for" lists what Kalka should do, with what Figma does where a Figma user would expect it.

| Session              | Covers                                                             |
| -------------------- | ------------------------------------------------------------------ |
| `first-run.md`       | Opening Kalka, a first document, a first artboard                  |
| `tools.md`           | The toolbar and shortcuts, switching between tools, comment mode   |
| `draw-and-snap.md`   | Drawing in an artboard, snapping, layers wider than their artboard |
| `layers-panel.md`    | Order, reordering, nesting, renaming, hiding, locking, selecting   |
| `auto-layout.md`     | Auto layout, gaps, padding, hug and fill, reordering in a flow     |
| `text.md`            | Typing, editing, fonts, other scripts                              |
| `breakpoints.md`     | Tablet and phone artboards, edits per width, deleting one          |
| `clipboard.md`       | Copy and paste between artboards, documents and other apps         |
| `save-and-reopen.md` | Saving, closing with unsaved changes, reopening a file             |
| `export-html.md`     | Exporting a page as HTML and opening it in other browsers          |
| `theme.md`           | Light and dark, on every platform                                  |
| `comments.md`        | Pinning, replying, leaving comment mode                            |

## Playing a session

- Run the build under test: `bun run dev:portless`, or the desktop app for `theme.md` and anything about windows. Open the browser at `/?test` so the welcome screen stays out of the way, unless the session tests it. Unsaved work from an earlier session still brings up the recovery dialog; close it, or use a fresh browser profile.
- Use the mouse and keyboard only. A player who is an agent drives the browser with real pointer and key input and never reaches into the page (`window.kalka`, the store, `page.evaluate`): what a script can do, a user cannot.
- Keep Figma's behavior in mind as the reference for anyone switching over. Where Figma differs and Kalka chose otherwise on purpose (layers are HTML, the canvas is a page), the finding says so rather than calling it a bug.
- Take a screenshot or a short recording for every finding. A finding without one is a hunch.
- A session takes 10 to 20 minutes. Stop a mission after two minutes of being stuck: being stuck is the finding.

## Reporting

Write one report per session played, in the ignored `scratch/user-sessions/`, named `<date>-<session>-<platform>.md`:

```markdown
# <session>, <date>, <platform and browser>, build <version or commit>

## Findings

### <what went wrong, in a few words>

- Severity: blocker | major | minor | polish
- Mission: <which one>
- Did: <what the player did>
- Kalka: <what happened>
- Expected: <what the player expected, and what Figma does>
- Evidence: <screenshot or recording file>

## Went well

<what worked without thinking, worth keeping>
```

Severity: **blocker** stops the mission, **major** needs a workaround or loses work, **minor** surprises but the player gets there, **polish** looks or feels off. Each blocker and major finding becomes an issue, and a spec in `tests/e2e` once fixed.
