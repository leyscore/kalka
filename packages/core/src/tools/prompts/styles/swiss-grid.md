# Swiss Grid

## 1. Essence

Order you can feel without seeing it. A flush-left grotesque, large jumps in scale, and every edge landing on the same column starts, so the grid shows through alignment. Lines are rare and carry meaning; the page is open, not ruled.

Use this style only when the subject is systematic itself: transit, typography, rationalist architecture, data publications, design studios. If the subject is not one of these, go back to `index.md`.

## 2. Grid

- Page 1440. Margins 72. Content 1296. 12 columns of 86 px, gutter 24 (one body line, the same empty line that separates fields vertically).
- Spans: 1 = 86, 2 = 196, 3 = 306, 4 = 416, 5 = 526, 6 = 636, 8 = 856.
- Baseline 8 px. Body line 24. All vertical spacing is a multiple of 8, and type sits on that baseline.
- Field: 144 px high (6 body lines); row pitch 168 (field plus one empty line of 24). Tops of unrelated blocks share a few field heights. Text starts at the top of its field; images end on a line, never between lines.
- Text measure: body spans 5 columns (526 px), about 63 characters or 9–10 words at 16 px. Aim for 7–10 words per line; short texts may take 4 columns (416 px). Never set text across 8 or more columns.
- Alternative for magazines: a 58-unit grid that divides into 2–6 columns with 2-unit gutters. At 1440 use a 22 px unit: content 1276, margins 82, gutter 44; 2 columns of 616, 3 of 396, 4 of 286, 5 of 220, 6 of 176. Pick one grid per page.
- Alignment rules, which replace drawn lines:
  - Every block starts on a column start. No centred blocks, no centred text.
  - Reuse at most three left edges per page for text (for example columns 1, 4 and 7). The repetition is what makes the grid felt.
  - Align the tops of neighbouring blocks to the same baseline, and their first lines, not their boxes.
  - Leave whole columns empty. Asymmetry (text in 4–8, nothing in 9–12) shows the grid better than filling it.
- Mobile (390): 4 columns, 16 px margins, gutter 16. Hanging labels move above their text; poster type drops to 64–80 px.

## 3. Type

One family, two weights. Prefer a grotesque that is not a recent default.

| Family                                         | Use                       | Note                                       |
| ---------------------------------------------- | ------------------------- | ------------------------------------------ |
| Schibsted Grotesk                              | everything                | sturdy, good for transit and data          |
| Instrument Sans                                | everything                | narrower, studios and foundries            |
| Archivo (width axis 62–125, or Archivo Narrow) | text + poster             | narrow widths for headlines and timetables |
| IBM Plex Sans (+ Plex Mono for tables only)    | everything                | systematic, data publications              |
| Inter Tight                                    | everything, in one family | tight poster setting                       |

Inter, Geist, Hanken Grotesk, Public Sans and Familjen Grotesk are on the reflex or recent-default lists. Use one only with a stated reason.

Scale: at most four sizes per page, five when one display word is set larger. Each step must be clearly distinct, and every line height locks to the 24 px body line within a few lines.

| Role                    | Size / line        | Tracking                    | Weight     |
| ----------------------- | ------------------ | --------------------------- | ---------- |
| Small, labels, captions | 12/16              | +0.01 em (+0.06 em in caps) | 400 or 600 |
| Body                    | 16/24              | 0                           | 400        |
| Head                    | 32/48              | -0.01 em                    | 600        |
| Display                 | 64/72              | -0.02 em                    | 600        |
| Poster                  | 128/120 or 160/144 | -0.03 to -0.04 em           | 600–700    |

Rules:

- Flush left, ragged right. Never justified, never centred.
- Two weights only: 400 and 600 (or 700). Contrast comes from size and weight within one family, never from a second grotesque.
- Sentence case for headings. Caps only for 12 px labels.
- No italics for emphasis; use weight or nothing.
- Tabular figures everywhere numbers stack.
- Headlines may break by hand to make a strong rag; use `<br>` with intent rather than `text-wrap: balance` for poster type.

## 4. Spacing

- Scale: 8, 16, 24, 48, 72, 96, 144, 168, 336.
- Section padding: 168 between related sections, 336 before a new chapter. Do not use the same value for every section.
- Label to text: 0 vertical (the label hangs beside, in its own columns, same baseline).
- Head to body: 24. Paragraph to paragraph: 24 (no indent).
- Image to caption and image to image: one or two whole lines (24 or 48), never a half line.
- Type inside an accent field: inset at least 24 from every edge, so the field always reaches past the text.
- Table rows 48; cell padding 0 16 0 0 (text hangs from the column start, never indented inside a box).

## 5. Colour

- **Ground:** #FFFFFF or #F4F4F2. One tinted surface per page at most.
- **Ink:** #111111. Secondary #6B6B6B (5.32 on white, 4.83 on #F4F4F2; use #5F5F5F at 5.79 on the off-white for small text).
- **Accent:** choose one.
  - Red #D8232A (5.00 on white, 4.54 on #F4F4F2; white on red 5.00).
  - Ultramarine #1F3FFF (6.53 on white, 5.93 on #F4F4F2; white on it 6.53).
  - Yellow #FFD400, only behind black ink (#111111 on it is 13.19). Never yellow text.
  - #FF2A1F is 3.74 on white: use it only for fields, large type at 24 px and up, and graphics, never small text. #111111 on it is 5.03.
- **Accent behaviour:** the accent is either a mark (under 3% of the page: a dot on the active line, a single number, a link) or one field (20–40% of the first screen: a solid block holding type). Never both on the same page.

Palettes:

| Name      | Ground  | Ink             | Secondary      | Accent                                         |
| --------- | ------- | --------------- | -------------- | ---------------------------------------------- |
| Timetable | #FFFFFF | #111111 (18.88) | #6B6B6B (5.32) | red #D8232A field with white type (5.00)       |
| Foundry   | #F4F4F2 | #111111 (17.14) | #5F5F5F (5.79) | ultramarine #1F3FFF mark (5.93)                |
| Signal    | #FFFFFF | #111111         | #6B6B6B        | yellow #FFD400 field with #111111 type (13.19) |

## 6. Surfaces

- Radius 0. No shadows. No gradients.
- **Lines are for three jobs only:**
  1. Tables and data: a 2 px rule under the header row, 1 px between rows.
  2. One or two structural dividers per page: a 2–3 px rule that opens a chapter, spanning the columns of what it opens.
  3. A timeline or route line in a diagram, where the line is the data.
- Never draw a box around a block. Never draw column guides, a visible grid, a rule above every section, or a rule between every list item outside a table.
- Separation comes from space (168 or 336) and from the empty columns.
- One tinted surface at most (#F4F4F2 on a white page, or an accent field).
- No texture, no dot grid, no noise.

## 7. Navigation

- One row, 72 px tall, at 12/16. Items placed on column starts, not spread evenly: name in column 1, sections starting at column 7, contact at column 11.
- Active item: 600 weight or the accent mark. No underline bar, no pill.
- No sticky header unless the page is a long reference. If sticky, 48 px, ground colour, no shadow, no border; a 1 px rule only once content passes under it.

## 8. Hero patterns

**A. Poster (no photo).** One word or a short line at 128–160 px across columns 1–10, set tight, breaking by hand. Below it, a 16/24 paragraph in columns 7–11 aligned to a baseline 48 px under the poster. A 12 px label in columns 1–3 on that same baseline. Nothing else on the first screen.

**B. Split field (no photo).** An accent field across columns 7–12 (and to the page edge, full-bleed right) at the full first-screen height, holding one number or word at 128 px in white or black. Text in columns 1–5: display head 64/72, body 16/24, one text link. The figure inside the field keeps at least 24 px from its edges.

**C. Index hero.** Display head 64 px in columns 1–8. Below, a table of the subject's items (lines, typefaces, projects, datasets) as the hero: 48 px rows, columns aligned to the grid, tabular figures. The table is the image.

## 9. Section patterns

- **Hanging label.** Label 12 px in columns 1–3, text in columns 4–8, aligned on the first baseline. Columns 9–12 empty or holding one figure. This is the default text section.
- **Image grid of two formats.** Mix two ratios only (for example 4:5 and 3:2), placed on column spans and field heights. Captions 12/16 under each, one line (24) below the image, flush left.
- **Numbered facts.** Only for a real sequence (route stops, process stages, years). Number at 64 px in column 1–2, text in 3–6.
- **Data table or price list.** 48 px rows; 2 px header rule; 1 px row rules; numbers right-aligned in tabular figures; units in the header, not in every cell.
- **Marginal notes.** Notes at 12/16 in columns 10–12 beside body in 4–8.
- **Asymmetric two-part.** A display head across 1–6, the body starting at column 7 one row lower. Uses the offset as the design.
- **Specimen.** For type subjects: a line of the typeface at 128 px, then the character set at 32/48, then sizes in a table.

## 10. Imagery and its no-photo fallback

- Photos: architectural, objects, frontal and documentary, cropped square to the field. Black and white or natural colour, never filtered.
- **No photo:**
  1. Type as the image: poster hero A, or a single numeral at 160 px.
  2. One flat accent field with a word or figure inside.
  3. Geometric abstraction drawn in SVG from the subject (a route line with stops, a bar chart of real values, the outline of a building plan), in ink and the accent.
  4. Below the fold only: a field of #E6E6E3 at the image's ratio with a 12 px caption saying what the photo shows (#111111 on it is 15.09).

## 11. Product UI in this style

For data publications or transit apps, draw the UI as part of the grid: a departure board, a dataset table, a filter row. Text 13–14 px, rows 40 px, radius 0, no frame shadow. The UI aligns to the page's column starts, so it reads as part of the page rather than a screenshot.

## 12. Signature moves

1. A poster-scale word set by hand at 128–160 px.
2. Hanging labels in columns 1–3, same baseline as the text.
3. Three repeated left edges, no centred block anywhere.
4. Whole empty columns on the right.
5. One accent field, or one accent mark, never both.
6. A data table as a visual, with a 2 px header rule.
7. Four sizes, two weights.
8. Section spacing of 168 and 336 instead of dividers.

## 13. Anti-patterns

1. Rules around every block, or a rule above every section.
2. Visible column guides or a background grid.
3. Centred headings or centred hero stacks.
4. More than four type sizes (five with one display word).
5. Italic for emphasis.
6. Rounded corners or shadows.
7. A body column wider than 6 columns.
8. Evenly spread navigation items.
9. Three equal cards in a row.
10. Index numbers on items that are not a sequence.
11. The accent used as both a field and many marks.
12. #FF2A1F or yellow for small text.
13. Grey boxes as image placeholders on the first screen.
14. Mixing two grotesques, or two sizes so close they read as a mistake.
15. Text that starts between column starts.
16. Choosing this style for a bakery, a clinic, a bank or any subject that is not systematic.
17. Mono labels used to look technical.

## 14. Overrides of the global anti-slop

- **Index numbers: allowed** only for real sequences: route stops, process stages, chapters, years.
- No other override. Tracked eyebrows, mono labels and visible grids stay banned. Small caps labels are allowed only as 12 px caps at +0.06 em hanging in columns 1–3, not as eyebrows above headings.

## 15. Breakable rules (when the person asks for something bolder)

1. **Flush left only.**
   - Protects: the reading line and the grid's left edges.
   - Breaking gives: a single line set flush right against column 12 creates tension across the page.
   - Allowed when: it is one line of display type, balanced by flush-left text below.
2. **Four sizes.**
   - Protects: clear hierarchy.
   - Breaking gives: a type specimen or a scale demonstration needs many sizes.
   - Allowed when: the subject is typography and the sizes form a visible series.
3. **No visible lines beyond tables and one or two dividers.**
   - Protects: the open page.
   - Breaking gives: a transit map or route diagram where lines are the content.
   - Allowed when: every line is data (a route, a timeline), never decoration.
4. **Radius 0.**
   - Protects: the rational, hard-edged voice.
   - Breaking gives: a circle used as a signal (a stop, a station disc) adds a single counterform.
   - Allowed when: the circle is a sign from the subject's own system.

## 16. Self-check

1. Is the subject systematic itself (transit, typography, rationalist architecture, data, design studio)?
2. Can you find the grid by alignment alone, with no drawn guides?
3. Are lines limited to tables, data and at most two dividers?
4. Does every block start on a column start, with nothing centred?
5. Are there at most four type sizes (five with one poster word) and two weights?
6. Does body text span 5 columns or fewer?
7. Is the accent either a mark or a field, not both?
8. Is there at least one empty column region on the first screen?
9. Do section paddings vary (168 and 336)?
10. Without photos, is the first screen strong on type or a field alone?
11. Do all text pairs pass 4.5:1, with #FF2A1F and yellow kept off small text?
