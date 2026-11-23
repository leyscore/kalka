# Editorial

## 1. Essence

A page that reads like a well-edited publication. Serif text at a generous size, a narrow text column with a live margin beside it, and rules that open sections rather than fence them. Hierarchy comes from type tiers and white space, not from boxes or colour.

## 2. Grid

- Page 1440. Margins 96. Content 1248. 12 columns of 82 px, gutter 24.
- Column map, used on every page:
  - **Meta column:** columns 1–2 (188 px). Section labels, dates, bylines, figure numbers.
  - **Text column:** columns 3–8 (612 px). At 20 px serif this gives about 65 characters per line.
  - **Notes column:** columns 10–12 (294 px). Sidenotes, captions, pull facts. Column 9 stays empty as an air gap.
  - **Wide figure:** columns 3–12 (930 px).
  - **Full figure:** the 1248 content, or full-bleed for one image per page at most.
- Soft baseline of 4 px; body line 28 px. Align sidenote tops to the line of the paragraph they annotate. Add vertical space in whole body lines, so text returns on beat after heads and figures.
- Measure: body 60–70 characters (66 is the classic ideal), never below 45 or above 75. Dek and lead 45–55 characters.
- Mobile (390): 4 columns, 16 px margins. Notes fall below their paragraph, indented 16 px with a 1 px left rule. The meta column becomes a line above the headline.

## 3. Type

Pick one pair. Use the serif for text and display, the sans for labels, captions and interface.

| Serif (text, display)                    | Sans (labels, UI) | Character                                 |
| ---------------------------------------- | ----------------- | ----------------------------------------- |
| Newsreader                               | Instrument Sans   | contemporary news, optical sizes built in |
| Source Serif 4                           | Libre Franklin    | sober, reports, think tanks               |
| Libre Caslon Display + Libre Caslon Text | Libre Franklin    | classical, books, law                     |
| Literata                                 | Inter Tight       | long-form reading, essays                 |
| Spectral (+ Spectral SC for small caps)  | Work Sans         | literary, light                           |
| Petrona or Besley                        | Instrument Sans   | warmer, magazines with character          |
| Crimson Pro                              | Schibsted Grotesk | dense news, many headlines                |

Libre Caslon Display has one weight (400), so headlines in that pair stay at 400. Fraunces, Instrument Serif and Playfair are reflex faces on the anti-slop list. Use one only with a reason tied to the subject, recorded in the style comment.

Scale (px size / line-height, tracking):

| Role                     | Size / line            | Tracking  | Weight, case                 |
| ------------------------ | ---------------------- | --------- | ---------------------------- |
| Kicker                   | 12/16 sans             | +0.08 em  | 600, true small caps or caps |
| Caption, credit          | 14/20 sans             | 0         | 400; credit in 500           |
| Body                     | 20/28 serif            | 0         | 400                          |
| Dek, standfirst          | 24/32 serif            | -0.005 em | 400, may be italic           |
| Section head, pull quote | 36/40 serif            | -0.01 em  | 400–500                      |
| Headline                 | 60/64 serif            | -0.015 em | 400–600                      |
| Cover headline           | 96/96 or 120/112 serif | -0.02 em  | 300–500                      |

Rules:

- Use the optical size axis where it exists (Newsreader 6–72, Literata 7–72, Source Serif 4 8–60): text optical at 20 px, display optical at 60 px and up.
- Paragraphs: indent 1 em with no space between, or space with no indent. Never both. Do not indent the first paragraph after a head; open it with a drop cap or with its first words in small caps.
- Old-style figures in running text (`font-variant-numeric: oldstyle-nums`); lining tabular figures in tables.
- Small caps only as true small caps (a face that ships them, such as Spectral SC) or real caps at 12 px tracked +0.05 to +0.1 em. Never scaled-down capitals.
- Italic for titles of works, foreign terms and the dek. Never for one emphasised word in a headline.
- Headlines `text-wrap: balance`; body `text-wrap: pretty`. Hanging punctuation on pull quotes: shift the opening quote mark into the margin (`text-indent: -0.4em`).
- Curly quotes, real em dashes with thin spaces or none, real ellipses.

## 4. Spacing

- Scale: 4, 8, 12, 16, 24, 28, 56, 84, 112, 168.
- Headline to dek 16–24. Dek to byline 24. Byline to lede 56.
- Before a section head 56–84; after it 12–16.
- Between modules (a story to the next story, a long read to the index) 112–168.
- Between paragraphs 0 (with indent) or 28 (with no indent).
- Figure to caption 12. Caption to following text 28.
- Section padding: 112 between related modules, 168 before a change of subject. Never the same value for every section.

## 5. Colour

- **Grounds:** paper #FFFFF8, #F7F4EE or #FAF7F2. Tint band for one module: #EFEAE1.
- **Ink:** #111111 to #1C1A17. Secondary ink #5E5A55. Rules in ink at 1 px, or ink at 20% for hairlines.
- **Accent:** one, under 5% of the area. Oxblood #8A1C1C, deep green #1F4D3A or ink blue #1D3557. Use it for the kicker, links, the drop cap and one rule per page. Never for buttons spread around the page.
- **Dark band:** once per page at most, ink ground with paper text, for one feature or the footer.

Palettes (contrast measured on the stated ground):

| Name        | Ground  | Ink             | Secondary      | Accent                    |
| ----------- | ------- | --------------- | -------------- | ------------------------- |
| Newsprint   | #FFFFF8 | #111111 (18.80) | #5E5A55 (6.81) | ink blue #1D3557 (12.30)  |
| Quarterly   | #F7F4EE | #1C1A17 (15.81) | #5E5A55 (6.23) | oxblood #8A1C1C (8.45)    |
| Field notes | #FAF7F2 | #1C1A17 (16.24) | #5E5A55 (6.40) | deep green #1F4D3A (9.01) |

On the tint band #EFEAE1: ink #111111 is 15.75, secondary #5E5A55 is 5.70. On a dark band of #1C1A17, paper #F7F4EE is 15.81 and a muted #B9B2A8 is 8.26. On the placeholder #E9E4DA, caption ink #111111 is 14.90.

## 6. Surfaces

- Radius small and quiet: 6 px on buttons and inputs, 4–8 px on images and figures. Rules, not rounded boxes, mark the modules.
- No shadows.
- No cards. A module is defined by a rule above it and space around it.
- Rules: 1 px between items, 2 px or a double rule (1 px, 3 px gap, 1 px) to open a major section. A rule spans the width of what it opens, then type hangs from it with 12–16 px of space.
- One tint band per page for a module that needs separation (a newsletter sign-up, an index).
- Texture: none. Paper colour is the texture.

## 7. Navigation

- **Masthead pattern:** a top utility line (date, issue, sign-in) at 12/16 sans, then the masthead name centred or flush left at 36–56 px serif, then a section row at 14 px sans separated by space (24–32 px), with a 1 px rule above and below. Total 120–160 px.
- **Studio variant:** one 64 px row: name at 20 px serif left, four to six links at 14 px sans right, a 1 px rule below.
- Sticky: only the compact 48 px row, and only after scrolling past the masthead.
- The primary action is a text link in the accent or a small ink button (40 px tall, radius 6), never a pill.

## 8. Hero patterns

**A. Cover.** One image across columns 1–12 at 3:2 or 16:9, headline below at 96 px across columns 1–9, dek 24/32 across 3–8, byline in the meta column. Use whenever a photo makes sense; a `data-photo` placeholder counts.

**B. Type-only opener (no photo).** Kicker in the meta column. Headline 96–120 px across columns 1–10, balanced. Dek 24/32 in 3–8. Byline 56 px below. Then the lede starts with a plain, unornamented drop cap: `initial-letter: 3` in the accent colour, or a fallback float of about 103 px with a 4 px right gap; the rest of the first line may follow in small caps. Type alone fills the first screen.

**C. Split spread.** Headline and dek in columns 1–5, a tall figure (4:5) in 7–12 with its caption in the notes position below. The figure may be a drawn chart, a document facsimile in HTML, or a captioned placeholder at #E9E4DA if no photo exists.

## 9. Section patterns

- **Long read with sidenotes.** Text in 3–8, notes in 10–12 aligned to their paragraph, meta in 1–2. Notes 14/20 sans, numbered with superscript figures that match markers in the text.
- **Pull quote.** One per 600 words of text, never more. 36/40 serif across 3–10, hanging opening quote, attribution 14 px sans. No box, no tint, no giant decorative quote mark.
- **Front-page index.** A list of 5–9 items. Each: kicker, headline 24–36 px, one-line dek, date. Lead item larger (60 px headline, image if present). Items separated by 1 px rules. Uneven: lead takes 1–8, two secondaries stack in 9–12, then a row of three.
- **Figure with caption and credit.** Caption 14/20 below or in the notes column; credit in 500 weight. Number figures only if the text cites them.
- **Q&A.** Questions in 600 sans 18/28, answers in serif body. Interviewer initials in small caps.
- **Menu or price list.** Dish in serif 20/28, description in italic 16/24, price right-aligned in tabular figures.
- **Colophon footer.** Small type, the publication's details, a 2 px rule above.

## 10. Imagery and its no-photo fallback

- Photos: documentary, not stock. Crop with intent: 3:2, 4:5, 16:9. Every image gets a caption.
- **No photo available:**
  1. Lead with the type-only opener (hero B). Never put a grey box at the top.
  2. Use the drop cap and a pull quote as the visual events.
  3. Draw what can be drawn in HTML: a chart with direct labels, a timeline, a facsimile of a letter or ledger in the text face.
  4. Below the fold, a placeholder is allowed at its real ratio: fill #E9E4DA, no icon, a caption that describes the intended photo ("Photograph: the reading room at opening time, from the gallery").

## 11. Product UI in this style

Rarely needed. For a publishing tool or subscription product, show a reading view: the article rendered in the product, at true size, inside a 1 px frame with radius 8 and no shadow, cropped at the bottom. Keep UI type in the sans at 13–14 px.

## 12. Signature moves

1. The three-column map: meta, text, notes, with an empty column 9 as air.
2. A drop cap in the accent that is three lines tall.
3. Headline, dek, byline stack with distinct tiers (60, 24, 14).
4. Hanging punctuation on the pull quote.
5. Sidenotes aligned to their line, not stacked at the end.
6. Old-style figures in text, tabular lining figures in tables.
7. Rules that open a section (2 px or double) and hairlines that separate items.
8. One dark band, once.

## 13. Anti-patterns

1. Body text below 18 px or in the sans.
2. A text column wider than 75 characters.
3. Cards with shadows or rounded corners around articles.
4. Indent and paragraph space together.
5. Scaled-down capitals posing as small caps.
6. One word of a headline in italic or in the accent.
7. More than one pull quote per 600 words, or a pull quote in a tinted box.
8. A giant decorative quotation mark.
9. A grey rectangle as the hero image.
10. Centred body text.
11. Rules boxing every module on all four sides.
12. Bright accents (vermilion, electric blue) on paper.
13. Sidenotes collected at the bottom of the page.
14. Mixing three or more families.
15. Captions missing under images.
16. Index numbers 01, 02, 03 on items that are not a sequence.
17. A pill-shaped button in the masthead.
18. Every section padded the same.

## 14. Overrides of the global anti-slop

- **Tracked small caps: allowed** for kickers, the meta column, and interviewer initials. Use true small caps or 12 px caps at +0.06 to +0.08 em. Not for headings, not for buttons, not as an eyebrow above every section: one kicker per story at most.
- **Index numbers: allowed** for a real sequence only (chapters of a long read, issue numbers, footnotes).
- Everything else in the anti-slop list applies, including the ban on one word in italic or colour and the reflex-face list.

## 15. Breakable rules (when the person asks for something bolder)

1. **No shadow.**
   - Protects: the flat sense of a printed page.
   - Breaking gives: a single object (a book, a ticket, a magazine) can sit on the page with a real shadow, which reads as a photographed thing.
   - Allowed when: the subject sells a physical printed object and the object is drawn in HTML.
2. **One serif, one sans.**
   - Protects: calm and authority.
   - Breaking gives: a third display face for the cover only creates a magazine-cover voice.
   - Allowed when: the page is a single feature or issue launch, and the third face appears only once.
3. **The text column stays in 3–8.**
   - Protects: the measure and the margin for notes.
   - Breaking gives: a full-width paragraph at 36 px reads as a manifesto.
   - Allowed when: the page has one statement worth that scale, used once, at most 40 words.
4. **Accent under 5%.**
   - Protects: the ink-on-paper restraint.
   - Breaking gives: a full-colour cover band in the accent becomes an issue's identity.
   - Allowed when: the band is the cover of a dated issue, with paper type on it at 4.5:1 or better.

## 16. Self-check

1. Is the body serif at 20 px with a line of 28 px or close to it?
2. Does every line of body text stay under 75 characters?
3. Do sidenotes or captions sit in the notes column beside what they annotate?
4. Is there a clear tier between headline, dek and byline?
5. Are there no cards, no shadows, and no rounded corners above 2 px?
6. Is the accent under 5% of the page?
7. Does every image or placeholder have a caption?
8. With no photo, does the first screen hold up on type alone?
9. Are small caps true small caps, used once per story at most?
10. Do section paddings vary between related and unrelated modules?
11. Is there at most one pull quote per 600 words?
12. Does the page pass 4.5:1 for all text, including captions?
