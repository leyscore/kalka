# User stories

Stories a person plays in the real interface, the way a designer opening Kalka for the first time, or arriving from Figma, would. They find what automated specs cannot: a control nobody notices, a tool that will not let go, a gesture that works differently from Figma, a flash on one platform. They do not replace `tests/e2e`; a finding that can be pinned down becomes a spec there once it is fixed.

## What a story is

Each file is one user story: who plays it, what they want and why, where it starts, and a few missions written as goals ("put the button flush with the artboard's right edge"), never as clicks. The player works out how to do it, as a user would. Under each mission, **In Figma** says how a designer does it in Figma and what they get, and **In Kalka, watch for** says what Kalka should do. Where Figma has no equivalent (breakpoints, HTML export), the story says so and Kalka is judged on its own.

| Folder        | What designers do there                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `basics/`     | First run, moving around the canvas, selecting and moving, switching tools, undo and history, pages                                                  |
| `drawing/`    | Shapes, snapping, pen and vectors, booleans and masks, images, fills, strokes and effects, icons                                                     |
| `layout/`     | Frames and groups, constraints, auto layout, nested auto layout, grids and guides, align and distribute, the layers panel                            |
| `text/`       | Writing text, typography details, fonts, text styles                                                                                                 |
| `system/`     | Colors and variables, light and dark modes, components, variants and properties, libraries                                                           |
| `build/`      | Whole jobs: a landing page hero, a navigation bar, a grid of cards, a pricing table, a sign-up form, a dashboard, a mobile app screen, button states |
| `responsive/` | Breakpoints, from desktop to mobile                                                                                                                  |
| `prototype/`  | Links and preview, interactions                                                                                                                      |
| `handoff/`    | Exporting assets, exporting HTML, inspecting code                                                                                                    |
| `files/`      | Saving and reopening, importing a Figma file, pasting from Figma, copy and paste, importing from the web                                             |
| `collab/`     | Comments, sharing and working together                                                                                                               |
| `ai/`         | Building with the agent, asking the agent about a selection                                                                                          |
| `platform/`   | Light and dark interface, the desktop window, a large file, keyboard and accessibility                                                               |

## Playing a story

- Run the build under test: `bun run dev:portless`, or the desktop app for `platform/` and anything about windows. Open the browser at `/?test` so the welcome screen stays out of the way, unless the story tests it. Unsaved work from an earlier session still brings up the recovery dialog; close it, or use a fresh browser profile.
- Use the mouse and keyboard only. A player who is an agent drives the browser with real pointer and key input and never reaches into the page (`window.kalka`, the store, `page.evaluate`): what a script can do, a user cannot.
- Do the mission in Kalka first, the way you would in Figma. Where the **In Figma** line is unsure for your version or keyboard layout, check it in Figma and correct the story.
- Where Figma differs and Kalka chose otherwise on purpose (layers are HTML, the canvas is a page), the finding says so rather than calling it a bug.
- Take a screenshot or a short recording for every finding, and for a comparison, one of Figma doing the same. A finding without one is a hunch.
- A story takes 10 to 20 minutes. Stop a mission after two minutes of being stuck: being stuck is the finding.

## Reporting

Write one report per story played, in the ignored `scratch/user-sessions/`, named `<date>-<folder>-<story>-<platform>.md`. Every mission gets a verdict against Figma, and every gap a finding:

```markdown
# <folder>/<story>, <date>, <platform and browser>, build <version or commit>

## Missions

| Mission   | Figma             | Kalka            | Verdict                      |
| --------- | ----------------- | ---------------- | ---------------------------- |
| <mission> | <what Figma does> | <what Kalka did> | same, better, worse, missing |

## Findings

### <what went wrong, in a few words>

- Severity: blocker | major | minor | polish
- Mission: <which one>
- Did: <what the player did>
- Kalka: <what happened>
- Figma: <what Figma does>
- Evidence: <screenshot or recording files>

## Went well

<what worked without thinking, worth keeping>
```

Severity: **blocker** stops the mission, **major** needs a workaround or loses work, **minor** surprises but the player gets there, **polish** looks or feels off. Each blocker and major finding becomes an issue, and a spec in `tests/e2e` once fixed. Count the verdicts across stories to see where Kalka stands against Figma over time.
