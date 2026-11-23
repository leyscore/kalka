# Blueprint

## 1. Essence

The page as a technical drawing sheet: thin lines with meaning, mono labels, a title block bottom right, hatching and a revision table, on drafting paper, cyanotype or graphite. Everything drawn is measured and follows drawing practice; nothing is decoration.

## 2. Grid

- Page 1440. Margins 48. Content 1344. 12 columns of 90 px, gutter 24.
- Alternative sheet grid: 16 cells of 84 px with 1 px lines between, for pages built as a sheet of cells.
- Graph paper (24 px minor, 120 px major) is allowed only behind a drawing or diagram, clipped to that figure's frame. Never behind text or across the page.
- Text measure 560–640 px at 16 px.
- **Hero sheet frame** (only if the page opens as a drawing): 2 px, inset 32 from the viewport; the 1440 page stands for an A3 sheet (1 mm ≈ 3.4 px). Zone marks in 12 px upright mono caps: letters top to bottom (no I or O), numbers left to right, fields about 168 px, so 1–8 across and A–F down. Centring marks: a 2 px tick at the middle of each side, crossing the frame by 8.
- Mobile (390): 4 columns, 16 margins, frame inset 12 without zone marks, title block as label-value rows, drawings at full width with `vector-effect: non-scaling-stroke`.

## 3. Type

| Sans                                         | Mono                      | Note                            |
| -------------------------------------------- | ------------------------- | ------------------------------- |
| IBM Plex Sans                                | IBM Plex Mono             | the safe engineering pair       |
| Archivo or Inter Tight                       | JetBrains Mono            | sharper, robotics and aerospace |
| Chivo                                        | Chivo Mono                | warmer, audio gear and kits     |
| Archivo Narrow or Barlow Condensed (display) | IBM Plex Mono             | dense spec sheets               |
| Martian Mono or Doto                         | for one display line only | readouts, counters              |

Space Grotesk and Geist are reflex faces; use them only with a reason. Pixel faces only for a single readout. Display may drop to weight 300.

Scale: 11 / 12 / 14 / 16 / 20 / 28 / 40 / 56 / 80 (96 for one word). From 14 up, each step is about √2, the ratio of the standard lettering heights (2.5, 3.5, 5, 7, 10, 14, 20 mm).

| Role           | Size / line         | Tracking          | Weight  |
| -------------- | ------------------- | ----------------- | ------- |
| Dimension text | 11/14 mono          | +0.04 em          | 400     |
| Label          | 11–12/16 mono caps  | +0.08 to +0.12 em | 500     |
| Data           | 14/20 mono          | 0                 | 400     |
| Body           | 16/25 (1.55) sans   | 0                 | 400     |
| H3             | 20/26 sans          | -0.01 em          | 500     |
| H2             | 28/34 to 40/44 sans | -0.02 em          | 500     |
| Display        | 56/56 to 80/78 sans | -0.03 em          | 300–500 |

Rules:

- Body in the sans, never in mono.
- Mono for labels, data, part numbers, dimensions and tables.
- Labels in caps; everything else in sentence case.
- Lettering in drawings is upright.
- Tabular, slashed-zero figures where available (`font-feature-settings: "zero", "tnum"`).
- Part numbers and revisions follow a pattern: `HX-204-B`, `REV C`, `DWG 0417`.
- Title block: title 28–40; drawing number in mono at 20 or more and at least two thirds of the title; entries 14 mono under 11 caps labels; notes 12–14.

## 4. Spacing

- Scale: 4, 8, 12, 16, 24, 32, 48, 72, 96, 120.
- Section padding 96; 120 around the hero sheet. Vary: 72 between a drawing and its spec table.
- Label to value 4–8. Rows 40, or 32 dense.
- Leaders 24–48 long, ending in a dot (2 px radius) on a surface or an arrowhead on an edge. Parallel lines at least 3 px apart.

## 5. Colour

- **Grounds:** drafting paper, cyanotype (mid Prussian blue, as archive prints are), or graphite.
- **Lines** are ink-coloured: dark on paper, white on blue or graphite. Construction and graph lines may be faint; outlines, dimensions and axes need 3:1.
- **Signal:** one hue for a highlighted part, a warning or the active revision, under 3 % of the area. A coloured line inside a drawing needs a legend.

Palettes (WCAG 2, truncated):

| Name      | Ground  | Ink / ink-2                      | Lines                                                                  | Signal                                                                                                              |
| --------- | ------- | -------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Drafting  | #f4f4f1 | #111318 (16.86) / #5b6068 (5.74) | #c9ccd1 (1.46, construction only); #5b6068 for dimension lines         | #e8501e (3.4: graphics and text 24 px and up only); small signal text #c2410c (4.69); blue #1f4fa8 (6.94) for links |
| Cyanotype | #1f4962 | #eaf1f8 (8.42) / #b4c8db (5.58)  | white at .5 for drawing lines (3.70); .07 graph minor, .14 graph major | coral #ffa697 (5.09) or cyan #7fe0d0 (6.15)                                                                         |
| Graphite  | #17181b | #e8e6e1 (14.23) / #9a9893 (6.15) | white at .12 and .24; .5 for information lines                         | orange #ff6a3d (6.23) or acid #dff140 (14.19) for one readout                                                       |

No amber or yellow signal on cyanotype (amber on navy is on the anti-slop list). No #565654-style grey text on near-black (about 2.8). Primary buttons: ink #111318 with #f4f4f1 text on paper (16.86); #eaf1f8 with #1f4962 text on cyanotype (8.42).

## 6. Surfaces

- Radius 0; controls 2–4.
- No shadows. No gradients.
- **Line weights 4 : 2 : 1:** 1 px for dimensions, hatching, leaders, centre, hidden and grid lines; 2 px for visible outlines and the sheet frame; 4 px for a section-cut outline or one emphasised part. Two weights in every drawing, all three in the hero; the hierarchy is the style.
- **Dashes** scale with the line width (values for 1 px, doubled for 2 px): hidden `12 3`; centre `24 3 1 3`; phantom `24 3 1 3 1 3`. No hidden line under 27 px; a centre line under 55 px is drawn continuous.
- **Cutting plane:** the centre pattern with 4 px strokes at the ends and turns, arrows for the view direction, letters `A–A`.
- **Hatching:** 1 px at 45° to the main outline, 6–8 px pitch; adjacent parts at −45° or another pitch; sections under 6 px filled solid.
- Registration crosshairs (12 px, 1 px) on one figure frame per page at most.
- Tables and title blocks have 1 px borders; text sections get no boxes.

## 7. Navigation

- 56 px bar: the name and a part-style code left (`HADLEY / SYS-01`), links in 12 px mono caps at +0.08 to +0.12 em, one ink button (radius 2) right.
- A 1 px rule below. Not sticky, or sticky at 48 px with the ground colour.

## 8. Hero patterns

**A. Drawing sheet with title block (no photo).** A full-width sheet with the 2 px frame inset 32, zone marks and centring marks.

- **Drawing:** an SVG line drawing of the product across columns 1–8, with three weights, centre lines and 3–5 dimensions.
- **Title block,** bottom right, 432–620 px wide (the standard 180 mm is about 620 px at A3, 430 at A2). Fields: owner, title (the product name, 28–40 px sans), drawing number, document type (`ASSEMBLY`, `DATASHEET`), date of issue, created and approved initials, sheet `1 / 4`; optional revision, scale (`1:2` or `NTS`), status (`RELEASED`), units (`MM`).
- **H1:** the product name in the title block, plus a display line above the drawing.

**B. Spec split.** Display 56–80 px and a 2-line lead in columns 1–5; a spec table (part, value, unit, tolerance, 40 px rows) in 7–12; the drawing below the fold.

**C. Viewport.** A large framed exploded view or hatched `A–A` section cropped by the first screen's bottom, 4–6 numbered callouts to margin labels, text in a narrow left column.

## 9. Section patterns

- **Title block.** Reused as the footer or a section header.
- **Spec table.** Mono 14 px, 40 px rows, 1 px rules, units in their own column, tolerances (`±0.05 mm`).
- **Notes block.** A `NOTES` heading, then numbered general notes in mono 12–14 px. The first note states the unit: `1. ALL DIMENSIONS IN MM.`
- **Callout diagram.** A drawing with numbered balloons (24 px circles, 1 px, 11 px mono number) and leaders to a parts list (item, part number, description, quantity).
- **Cell grid.** Capabilities in bordered cells (1 px shared lines, no gaps, no radius), each with a part code, name, two lines and a small drawing; spans may differ.
- **Flow diagram.** 1 px boxes, orthogonal arrowed connectors, labels on lines, real steps only.
- **Revision table.** REV, DESCRIPTION, DATE, BY, APPROVED, as a changelog. Letters skip I and O (A … H, J, K, L, M, N, P…); US practice also skips Q, S, X, Z and goes on AA, AB after Y.
- **Sheet index (architects).** Sections numbered like a drawing set: `A-101` plans, `A-201` elevations, `A-301` sections, `A-501` details. Every plan has a north arrow.
- **Pricing.** A bordered table, configurations as columns, not cards.
- **Scale and dimensions.** Scales `1:1`, `1:2`, `1:5`, `1:10`, `1:20`, `1:50`, `2:1`, `5:1`, `10:1` or `NTS`. One unit system per page; each feature dimensioned once; values above the line, parallel, near the middle; projection lines about 8 px past it; ends as filled arrowheads (15–90°) or 45° ticks, one kind per drawing.

## 10. Imagery and its no-photo fallback

- Photos are not needed. If used: neutral studio light, desaturated, crosshairs and a FIG caption; a `data-photo` placeholder at its real crop counts (global rule).
- **No photo:**
  1. A line drawing in SVG: orthographic views (front, side, top) or an isometric or exploded view, with the line weights and dimensions above.
  2. A cross-section with hatching and its cutting plane.
  3. A placeholder only below the fold: a 1 px frame with an X from corner to corner (1 px, ink-2) and a caption `FIG. 3 — Rear panel, connector detail`. Never on the first screen.

## 11. Product UI in this style

For software that controls hardware or engineering data: radius 2–4, 1 px borders, mono readouts with units (`23.4 °C`, `1 204 rpm`, `0.82 bar`), status as icon plus word (NOMINAL, DEGRADED, FAULT), a log with timestamps to the second. Rows 32–36, text 12–14, labels 11–12 caps at +0.12 em. Document states: `IN PREPARATION`, `UNDER APPROVAL`, `RELEASED`, `WITHDRAWN`.

## 12. Signature moves

1. A title block in the bottom right with drawing number, scale, sheet and revision.
2. Dimension lines with ticks or arrowheads and mono values above the line.
3. Three line weights in the ratio 4 : 2 : 1.
4. Centre, hidden and phantom lines with dash lengths scaled to the line width.
5. Hatching on one cut section, named by its cutting plane `A–A`.
6. Numbered callout balloons leading to a parts list.
7. A revision table whose letters skip I and O.
8. A sheet frame with zone marks and centring marks, or graph paper clipped to a figure, never across the page.

## 13. Anti-patterns

1. Graph paper or a dot grid behind the whole page.
2. Mono body text.
3. Lines that measure nothing, fake values ("1200px"), chains that don't add up, a feature dimensioned twice.
4. A single line weight everywhere, or weights not in the ratio 4 : 2 : 1.
5. Rounded cards and soft shadows.
6. Neon cyan on navy, or amber on navy.
7. Signal colour on more than 3 % of the area, or coloured drawing lines without a legend.
8. Orange like #e8501e for small text; information lines under 3:1.
9. Revision or zone letters I or O.
10. Pixel or terminal fonts for headings.
11. Boxes around every text block, or crosshairs on every figure.
12. Mixed metric and imperial units.
13. An empty X-box as the hero.
14. Non-standard scales, or a scale on a drawing that is not to scale.
15. A cyanotype ground darker than archive prints (navy near #0e2f57 reads as a dark theme).
16. Short centre lines drawn dashed, or 1 px dash patterns on thick lines.
17. A title block in the top left, or one without a drawing number.

## 14. Overrides of the global anti-slop

- **Mono labels: allowed** for labels, part numbers, dimensions, data, notes and tables: they are the drawing's annotation. Still banned for body text and eyebrows over marketing headings.
- **Drawn grid lines: allowed** when they are the drawing (graph paper clipped to a figure, the sheet frame and zone marks, the cell grid). A faint grid as page filler stays banned.
- **Tracked caps labels: allowed** in mono at 11–12 px, inside the drawing, title block, tables and nav only.
- Amber or signal yellow on navy stays banned.

## 15. Breakable rules (when the person asks for something bolder)

1. **Radius 0.**
   - Protects: the drafting voice.
   - Breaking gives: real part outlines with corner radii (`R12`) stay technical.
   - Allowed when: the radius belongs to the drawn object and is dimensioned.
2. **One signal hue.**
   - Protects: focus.
   - Breaking gives: a second system (electrical vs mechanical) reads clearly.
   - Allowed when: a legend explains both, inside drawings only.
3. **No photos.**
   - Protects: the drawn language.
   - Breaking gives: drawn callouts over a photo join object and spec.
   - Allowed when: the photo is real, callouts hit real features, once.
4. **Graph paper clipped to figures.**
   - Protects: the open page.
   - Breaking gives: a gridded cyanotype hero sheet evokes the print itself.
   - Allowed when: only the hero sheet, at .07 / .14, and no other grid.

## 16. Self-check

1. Does every drawn line have a meaning?
2. Are weights 4 : 2 : 1, with dashes scaled to each weight?
3. Do dimensions look real, add up, appear once and sit above their lines?
4. Is graph paper clipped to figures only?
5. Mono for labels and data, sans for body?
6. Is there a bottom-right title block with owner, title, drawing number, date, sheet and revision?
7. Is the signal under 3 %, never small text below 4.5:1, with a legend in drawings?
8. Do information lines reach 3:1, including the .5 white lines on cyanotype?
9. Do revision and zone letters skip I and O?
10. With no photo, is the hero a real line drawing, not an X-box?
11. Is the cyanotype signal neither amber nor yellow?
12. Is the unit stated in a note, and are scales written `1:2` or `NTS`?
