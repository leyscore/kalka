# Dark Precision

## 1. Essence

A dark, quiet page where the product is the hero, drawn true size and cropped by the fold. Tight grotesque type, a ladder of near-black surfaces, hairlines at a few percent white, and one accent. Precision comes from density and alignment, not from neon or glow.

## 2. Grid

- Page 1440. Content 1200. 12 columns of 78 px, gutter 24, margins 120.
- Spans: 2 = 180, 3 = 282, 4 = 384, 5 = 486, 6 = 588, 7 = 690, 8 = 792.
- Text measure 640 max; hero paragraph 540–560; heading block 792.
- Product frame up to 1320 wide (it may pass the content edge by up to 60 px each side), or bleeding off the right edge by at least a third of its width.
- Header 64 px.
- Mobile (390): 4 columns, 20 px margins. The product frame becomes a cropped detail at 1.0 scale (a panel, a list), never the full window shrunk to 30%.

## 3. Type

| Sans                                             | Mono           | Note                                |
| ------------------------------------------------ | -------------- | ----------------------------------- |
| Inter Tight (display) + Inter with `opsz` (text) | JetBrains Mono | dense, editor-like                  |
| IBM Plex Sans                                    | IBM Plex Mono  | infrastructure, enterprise dev      |
| Geist                                            | Geist Mono     | very common: use only with a reason |
| Schibsted Grotesk                                | Fragment Mono  | less common, sharper                |
| Instrument Sans                                  | IBM Plex Mono  | research labs, model makers         |
| Onest or Manrope                                 | Martian Mono   | friendlier AI tools                 |

Inter and Geist are on the reflex list. Prefer Inter Tight with a different text face, Plex, Schibsted or Instrument Sans. If you use Geist, state why (for example, the product ships with it). An accent serif phrase is not part of this style by default.

Scale:

| Role                      | Size / line     | Tracking        | Weight  |
| ------------------------- | --------------- | --------------- | ------- |
| Mono label, key cap       | 12/16           | 0               | 400–500 |
| Small, meta, UI           | 13–14/20        | -0.005 em       | 400–500 |
| Body                      | 16/24 (1.5–1.6) | -0.01 em        | 400     |
| Lead                      | 18–20/28–30     | -0.015 em       | 400     |
| H3                        | 20–24/28        | -0.02 em        | 500–600 |
| H2                        | 48/48           | see family rule | 500–600 |
| Display                   | 56–64/1.0       | see family rule | 500–600 |
| Display (large, one line) | 72–80/1.0       | see family rule | 500–600 |

Display tracking depends on the family, because each face ships with different default spacing:

- Inter and Inter Tight: -0.022 to -0.03 em from 40 px up.
- Geist: -0.05 to -0.06 em from 40 px up.
- Plex, Schibsted, Instrument Sans, Onest, Manrope: -0.03 to -0.05 em from 40 px up.

Rules:

- Weights 500–600 for headings (a 510-style medium is ideal when the face is variable); never 700–900.
- Text tracking follows size: about -0.005 em at 14, -0.01 at 16, -0.015 to -0.02 at 20–32.
- Display leading 1.0–1.1; body 1.5–1.6.
- Mono only for code, commands, key caps, IDs and log lines. Not for section labels or eyebrows.
- Tabular figures in metrics and tables.

## 4. Spacing

- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- Section padding 96–160. Vary: 96 between a feature and its detail, 128 by default, 160 before a new chapter.
- Hero text to product frame 64–80.
- Card padding 24 or 32. Inside product UI, use UI spacing (4, 6, 8, 12).

## 5. Colour

**Cool dark (default).**

- Ground #08090a (or #0b0b0c). Surfaces #0f1011, #141516, #1a1b1d: the ground with about 3, 5 and 7% white laid over it, one step per elevation.
- Borders white at 6–8%; inputs and controls need a border of at least 3:1, about `#ffffff3d`.
- Text: #f7f8f8 (18.72), #d0d6e0 (13.64), #8a8f98 (6.13; 5.62 on #141516). #62666d is 3.45: meta and disabled only, never body.
- Long body copy in #d0d6e0 or brighter (7:1 or more); #8a8f98 for secondary lines, nav and meta.
- Primary button: off-white #e5e5e6 fill with #08090a text (15.83). Pure white works too but reads harder.
- Accent: one. Indigo #7170ff (5.18 as text; white text on it is 3.84, so use it for links, focus and selection bars, not filled buttons with white text). Sky #57c1ff (9.94; dark text on it 9.94). Green #3ecf8e (9.98; dark text on it 9.98). Blue #0070f3 is only 4.37 on #08090a: use it as a fill with white text (4.55), never as small text; for blue text use #3ba3ff (7.46).
- Accents on dark are lighter and less saturated than their light-mode twins. A fully saturated brand colour appears on one or two elements at most.

**Warm dark (variant).**

- Ground #2b2622 (OKLCH about 0.22 / 0.004 / 85). Raised #383330. Hairline #3f3a36. A deeper option is #1f1c1b.
- Ink #f7f5f0 (13.73; 15.54 on #1f1c1b). Strong body #dad2c1 (9.95). Body #c9c0ad (8.28). Mute #aea69c (6.22; 5.18 on #383330). On #1f1c1b a mute #a69b92 gives 6.22.
- Primary button: #f7f5f0 fill with #2b2622 text (13.73). No chromatic accent needed; if one is used, a warm amber like #e8a86b (7.3) for selection only.
- Use for: AI agents, writing tools, voice products, terminals that want to feel humane.

**Pure black (only with dim hairlines).**

- Ground #000000. Hairlines white at about 6%. Text #ededed (17.93) or #ffffff (21), secondary #a1a1a1 (8.12), meta #8f8f8f (6.49).
- Allowed only when every border is that dim. A pure black ground with 15% borders on every card looks like a default dark mode.

Palettes:

| Name        | Ground  | Text / 2 / 3                | Accent                                     |
| ----------- | ------- | --------------------------- | ------------------------------------------ |
| Cool editor | #08090a | #f7f8f8 / #d0d6e0 / #8a8f98 | #7170ff (5.18), selection and links        |
| Warm agent  | #2b2622 | #f7f5f0 / #c9c0ad / #aea69c | none, or #e8a86b (7.3)                     |
| Black API   | #000000 | #ededed / #a1a1a1 / #8f8f8f | #3ecf8e (green, as dark text on fill 9.98) |

Syntax colours on dark: keyword #F79CE0, string #ffdf9f, constant #8FA6FF, comment #8B93A1.

## 6. Surfaces

- Radius: 6 (buttons, inputs), 8 (menus, small cards), 12 (cards, product frame), 16–24 (large feature panels only).
- Borders 1 px at 6–8% white. A top inset highlight `inset 0 1px 0 #ffffff0d` on raised surfaces.
- Depth comes from the surface ladder, not from shadows. Shadow only on floating panels: `0 7px 32px #00000059`. Product frame: `0 24px 64px #00000080`.
- Header: `#0b0b0bcc` with `backdrop-filter: blur(20px)` and a bottom hairline after scroll.
- Texture: optional dot grid (22 px pitch, dots `#ffffff17`), masked to fade toward the edges, behind the hero only. Never across the page.
- No gradients on text. No neon edges. No glows standing in for shadows.

## 7. Navigation

- 64 px. Logo left (wordmark 16–18 px, weight 600). Links 13–14 px #8a8f98, hover #f7f8f8, spaced 24–32. Right side: a text link "Log in" and an off-white primary button 32 px tall, radius 6, label 13–14 px at weight 500.
- Optional key cap hint next to search (`⌘K` in an 18–20 px key cap).
- Sticky with the blurred header.

## 8. Hero patterns

**A. Statement over the product.** Display 64 px left-aligned in columns 1–8 (centring only if the product window is centred below and wider than the text). Lead 18–20 px in 1–6. Primary button and a secondary text link. 64–80 px below: the product window, 1200–1320 wide, cropped by the bottom of the first screen, with a floating command menu or toast overlapping its upper right edge.

**B. Text left, product bleeding right.** Text in columns 1–5. Product window starting at column 6 and running off the right viewport edge with at least a third of it hidden. Not a few dozen px: commit to the bleed.

**C. Terminal or palette (no product screenshot needed).** A terminal or command palette drawn in HTML at true size as the hero: prompt, a real command, 6–12 lines of output with uneven timings, one warning line. Text beside it in columns 1–5.

## 9. Section patterns

- **Logo wall.** Real customer names as text wordmarks at 40% white, 5–6 per row, no fake logos. If none are known, omit the section.
- **Feature trio with UI fragments.** Three items of unequal width (5/4/3 or 7/5 then 12), each with a cropped piece of real UI (a filter menu, a diff, a graph), not an icon.
- **Large feature.** Heading in 1–5, UI panel 6–12 cropped right; repeat at most twice per page and never alternate left-right more than once.
- **Code tabs.** Tabs (cURL, Node, Python) at 32 px, code 13/20 mono with syntax colours, a copy button. Keys visibly fake (`sk_test_…`).
- **Metrics strip.** Three or four uneven numbers with a source ("p99 212 ms across 14.2 B requests in Oct"). Tabular figures.
- **Changelog.** Date, version, two lines, a link. Real dates.
- **Closing CTA.** A heading and two buttons on the ground. No boxed card, no glow behind it.

## 10. Imagery and its no-photo fallback

Photos are not used. The image is always the product or its output.

- App window with sidebar and content, true size.
- Terminal, command palette, code editor, diff view, log stream.
- A chart with 1.5 px lines, gridlines `#ffffff0a`, direct labels.
- Never an illustration of abstract shapes, an orb, or a 3D blob.
- A screenshot with a white background must be dimmed or redrawn dark; a bright rectangle on a dark page breaks the ladder.

## 11. Product UI in this style

- Window bar 36–40 px with the product's own tabs or breadcrumbs, not three traffic-light dots plus a fake URL.
- Sidebar 220–240: workspace switcher, 6–9 nav items at 13 px, rows 28–32, a section label, a few pinned items with counts.
- Main: a list or table of 8–12 rows, 36–40 px each, with structured IDs (`ENG-2147`), assignees as 18 px avatars, states with icon and word (In review, Blocked, Done), relative times.
- Selected row: background #ffffff0a and a 2 px accent bar on the left.
- A floating menu or popover (shadow `0 7px 32px #00000059`) overlapping the frame edge.
- Popovers and menus sit one surface step brighter than what they float over.
- At least one non-happy state: a failed check, a blocked issue, a 502 in the log.

## 12. Signature moves

1. Product frame cropped by the fold, true size, with a floating panel across its edge.
2. Off-white primary button on near-black.
3. Hairlines at 6–8% white; the surface ladder carries depth.
4. Tight display tracking, set per family.
5. Mono used only for code, keys and IDs.
6. A key cap hint in the nav.
7. One accent used for selection, links and focus.
8. A metrics strip with sourced, uneven numbers.

## 13. Anti-patterns

1. Multiple glows, orbs, or a gradient mesh behind the hero.
2. Neon borders or gradient text.
3. Mono for section labels or eyebrows.
4. Borders at 15–20% white on every card.
5. Pure #000 with bright borders.
6. A product screenshot shrunk so its text is 8 px.
7. Three equal feature cards with icons.
8. Fake logos or "Acme".
9. A fake browser URL bar on the product frame.
10. Every row in the happy state; round numbers.
11. #62666d or another sub-4.5 grey for body text.
12. A blue or indigo filled button with white text below 4.5:1.
13. A dot grid across the whole page.
14. Bento as the entire page.
15. A boxed CTA card with a glow.
16. Display weights of 700–900.
17. Overflowing the product by a few dozen px.
18. Real-looking API keys.
19. Geist-level tracking (-0.06 em) on Inter, which makes letters collide.
20. A fully saturated accent on large areas.

## 14. Overrides of the global anti-slop

- **One soft glow behind the product frame: allowed.** A single radial gradient, white or the accent, at 4–13% alpha, 400–1200 px across, centred behind the upper half of the product window. Never behind text, never two, never animated.
- **Mono: allowed** for code, terminal output, key caps, IDs and log lines. It stays banned as a decorative label.
- **A dark mode with one glow** is therefore allowed here; a glowing page (glows on cards, buttons, text) is not.

## 15. Breakable rules (when the person asks for something bolder)

1. **One accent.**
   - Protects: focus and calm.
   - Breaking gives: a second hue for a single status-rich visual (a deployment graph) makes the data readable.
   - Allowed when: the second hue lives only inside the product UI as status, with icon and word.
2. **No photos.**
   - Protects: the product as hero.
   - Breaking gives: a single photo of a person or hardware in a dark crop can humanise an AI or hardware product.
   - Allowed when: the photo is real and dark-graded, and the product still appears on the first screen.
3. **Text left-aligned.**
   - Protects: the reading line and the asymmetry.
   - Breaking gives: a centred statement over a centred wide product feels like a launch.
   - Allowed when: the product frame below is wider than the text block and itself centred.
4. **Warm dark has no chromatic accent.**
   - Protects: the paper-on-dark mood.
   - Breaking gives: one warm accent for selection adds life.
   - Allowed when: it is under 2% of the area.

## 16. Self-check

1. Is the product drawn true size, with body text in it at 12–14 px?
2. Is the product frame cropped by the fold or bleeding off an edge by at least a third?
3. Are hairlines at 6–8% white, and inputs at 3:1?
4. Is there at most one glow, at 13% alpha or less, behind the product only?
5. Is mono limited to code, keys, IDs and logs?
6. Is there one accent, used for selection, links and focus?
7. Does every text colour pass 4.5:1 on the surface it sits on, and long body copy 7:1?
8. Does the product show at least one non-happy state and structured IDs?
9. If the ground is #000, are hairlines at about 6%?
10. If the subject is humane (agents, writing, voice), did you consider the warm-dark variant?
11. Are there no fake logos and no fake URL bar?
12. Does display tracking match the family (Inter about -0.025 em, Geist about -0.06 em)?
