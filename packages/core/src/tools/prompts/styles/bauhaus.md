# Bauhaus

## 1. Essence

A page built like a Dessau print job of 1925–30: lowercase type, heavy black bars that organise the sheet, photographs set into the text, red and black as the working colours, and the three elementary shapes (circle, square, triangle) used rarely and on the grid. Moholy-Nagy named the aim as plain clarity of communication. The look comes from asymmetry, scale contrast and proportion, not from coloured shapes scattered across a template.

Use it for schools, studios, architecture and culture. Today's Bauhaus institutions (Dessau, Berlin, Weimar) use a grotesque in black on white, one saturated colour as a large field, square fields and bars, and no pastiche shapes. Aim for that discipline; shapes are an optional gesture.

## 2. Grid

- Page 1440. Content 1296. 12 columns of 86 px, gutter 24, margins 72. Spans: 3 = 306, 4 = 416, 6 = 636, 8 = 856.
- Asymmetric splits: 8/4, 3/9, 5/7; 6/6 only when one half is a solid field.
- The grid is shown by bars: one heavy black bar per screen marks a column line or a baseline. Default 18 px (the 1926 magazine's bar is about 1.3% of the page width); 12 px on dense pages; 24 px at most.
- Poster-like blocks use the DIN A ratio 1:1.414 (416 × 588, 636 × 899), as the school's print did from 1924–25.
- Measure 560–640 px at 18 px.
- Shapes, when used, snap to the grid: a circle's diameter equals a span (306, 416 or 636), a square sits on whole columns, a triangle's base spans whole columns.
- Mobile (390): 4 columns, 20 px margins, bars 8–12 px, at most one shape per screen at 160–240 px.

## 3. Type

Two type ideas: the constructed letter (Bayer's 1925 universal alphabet of a few arcs, three angles and straight lines; Albers' stencil letters) and the printed one, the heavy wide grotesque the print shop set. No original is on Google Fonts. Pick one family per page:

| Display                           | Text                      | Lineage                                            |
| --------------------------------- | ------------------------- | -------------------------------------------------- |
| Jost 500–700                      | Jost 400                  | constructed, nearest to Futura; the default        |
| League Spartan 600–800            | Karla                     | constructed, heavier, poster-like                  |
| Archivo 700–800 at `wdth` 112–125 | Archivo 400 at `wdth` 100 | printed: the wide heavy grotesque                  |
| Fira Sans 400–600                 | Fira Sans 400             | printed: the Bauhaus-Universität Weimar's face     |
| Work Sans 500–700                 | Work Sans 400             | printed, neutral; used by the Bauhaus network site |
| Kumbh Sans 600                    | Kumbh Sans 400            | constructed, rounder, for schools                  |
| Josefin Sans 600 (48 px and up)   | Work Sans                 | constructed, elegant; exhibitions                  |

Fallback stack: `"Jost", "Futura", "Century Gothic", "Avenir Next", system-ui, sans-serif` (or `"Archivo", "Helvetica Neue", Arial, sans-serif` for the grotesque).

Avoid Poppins and Montserrat (reflex faces) and anything imitating "Bauhaus 93", a 1970s novelty face with no link to the school.

Scale: 13 / 16 / 18 / 24 / 32 / 48 / 72 / 112 / 160.

| Role    | Size / line                   | Tracking | Weight  |
| ------- | ----------------------------- | -------- | ------- |
| Label   | 13/16                         | +0.06 em | 500     |
| Small   | 16/24                         | 0        | 400     |
| Body    | 18/28 to 20/30                | 0        | 400     |
| H3      | 24/30 to 32/38                | -0.01 em | 500–600 |
| H2      | 48/52 to 64/64                | -0.02 em | 500–600 |
| Display | 112/112 to 160/152 (0.95–1.0) | -0.02 em | 400–700 |

Rules:

- Lowercase is the voice. From 1925 the school printed in lowercase only, arguing economy. Set display, headings, navigation and labels in lowercase; keep body text in normal sentence case so it stays readable.
- Display at masthead scale: the 1926 magazine's masthead letters stand about 14% of the page width; on a 1440 page that is 160 px or more. Display weight can be regular (the Bauhaus-Archiv sets 115 px at 400) or heavy; the size carries it.
- Once per page, one name or date may run rotated 90° along a bar.
- No italics. Emphasis by weight, size or a colour field.

## 4. Spacing

- Scale: 8, 16, 24, 32, 48, 72, 96, 144.
- Section padding 144 top, 96 bottom; sections that share a colour field touch with 0 gap.
- Gaps inside a block 24–32; a large empty area beside a dense block is composition.
- Button padding 16 28.

## 5. Colour

- **Ground:** paper, slightly warm (hue 80–90, C ≤ 0.01), or plain white as the institutions use today. Pure white always for product UI.
- **Ink:** near-black #141414 for text and bars.
- **Red and black first.** Much Bauhaus printing was black plus one red; a page can be paper, ink and red only.
- **Primaries:** red, yellow and blue as solid fields and shapes. One is the UI accent (buttons, links, focus); the others are atmosphere only, per the global three-colour rule.
- **Area:** one primary may be the largest field on a screen (the Bauhaus-Archiv's red, the Weimar museum's blue). The other primaries together stay under 10%; never all three in equal areas.
- **Shape and colour:** Kandinsky paired the square with red, the triangle with yellow, the circle with blue. Keep this pairing when shapes appear.

Palettes (contrast truncated, WCAG 2):

| Name                | Ground / ground-2 | Ink / ink-2 / muted                               | Accent (UI)                                    | Atmosphere                                     |
| ------------------- | ----------------- | ------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| Dessau (default)    | #f2efe8 / #e8e3d8 | #141414 (16.04) / #4a4740 (8.06) / #6b675f (4.90) | red #c8261c (4.87 on ground; white on it 5.60) | yellow #f2c230 (ink on it 10.99), blue #1c1cbe |
| Red and black print | #f2efe8           | #141414                                           | red #c8261c                                    | none; bars and photos only                     |
| Weimar blue         | #ffffff           | #141414 (18.42)                                   | blue #1c1cbe (10.71; white on it 10.71)        | red #c8261c, yellow #f2c230                    |
| Archive red         | #ffffff           | #141414                                           | blue #36559b (7.16; white on it 7.16)          | red field #ff3333 with ink text (5.06)         |

Watch: muted #6b675f on ground-2 is 4.39 and red #c8261c on ground-2 is 4.37, so on the second ground use either only at 24 px and up. Red on #141414 is 3.28: never text. #ff3333 on white is 3.63: a field, not text. Yellow never carries text in its own colour on paper.

## 6. Surfaces

- Radius small: 4–6 on buttons, inputs and image corners; colour fields and bars stay square. A circle is a circle, not a rounded rectangle.
- No shadows. Depth comes from overlap: a shape on a field, a field over a photo.
- Black bars 12, 18 or 24 px, one width per page, used as rules, frames or heading underlines.
- Borders 2 px ink on inputs and cards, or a 3 px accent border for the one active item; otherwise a ground-2 fill with no border.
- Shapes in CSS or inline SVG: `border-radius: 50%`, a square div, `clip-path: polygon(50% 0, 100% 100%, 0 100%)`. Flat fills only.
- Shapes are optional: at most three per screen, one of each kind per section.

## 7. Navigation

- 72 px tall on the ground, with a 12 px black bar along its bottom or none.
- Name left, lowercase, 24 px, weight 600; the institution's real mark if it has one, else a 24 px square.
- Links 16 px lowercase, 32 px apart. Primary button: solid accent, white text, radius 4–6, 44 px tall.
- Sticky only on programme or catalogue pages.

## 8. Hero patterns

**A. Masthead.** The name in lowercase at 160–200 px across columns 1–10, as a magazine masthead. An 18 px black bar runs the full content width below it. Below it: a photo in columns 1–6 (636 × 424); lead paragraph at 20 px, dates and button in 8–12. Red appears once.

**B. Composition poster.** Lowercase display at 112–144 px in columns 1–8; a 416 px blue circle in 9–12 overlaps its end by a third; a 196 px red square below the circle; an 18 px bar under all. Then a paragraph and button in 1–5, dates in 9–12.

**C. Field and photo.** Columns 1–4: a field in the lead primary from nav to fold, with the display at 72 px over three lines and the button. Columns 5–12: a photo of the building or workshop at 3:2 (856 × 571).

**D. Nine squares (no photo).** Columns 3–12 hold a 3 × 3 arrangement of equal squares, after Joost Schmidt's lettering exercises. Three squares carry real content (programme, dates, place): one red, one ink with white text, one holding a blue circle. The name runs up the left margin, rotated 90°.

## 9. Section patterns

- **Programme table.** Courses, exhibitions or events as a real table: date (tabular), title (24 px), teacher or artist, room, status ("6 places left", "waitlist"). Rows 56 px, a 2 px ink rule under the header only.
- **Typophoto story.** Photos set into the text as part of the layout, not boxed: a photo spanning columns 1–8, a caption block in 9–12, the next paragraph starting beside its lower edge.
- **Shape as index.** Three programmes introduced by circle, square and triangle in their Kandinsky colours, 48 px, label beside.
- **Statement field.** A full-bleed primary field, 480–600 px tall, one lowercase sentence at 48 px.
- **Plan drawing.** A plan in 1.5 px ink lines, one room filled in a primary.
- **Footer.** On ink with paper text, address and opening hours in tabular figures, a red bar as the only ornament.

## 10. Imagery and its no-photo fallback

- Photos carry the page: Moholy-Nagy treated photography as typographic material. Buildings, workshops, objects, people at work. Hard light, steep angles from above or below, strong diagonals. Black and white when the subject's archive is (`filter: grayscale(1) contrast(1.1)`). Crops 3:2, 1:1, or 1:1.414. Placeholder: `<img data-photo="weaving workshop seen steeply from above, loom with tensioned warp threads, hard window light">`.
- **No photo:**
  1. Masthead (A) or nine squares (D).
  2. Construction drawings: the letters of the name on a visible grid of arcs and lines, ink 1.5 px, one shape filled.
  3. Colour-field index: each section opened by a field in its primary.
  4. Never clip-art shapes scattered as confetti.

## 11. Product UI in this style

App screens (course booking, studio management, a museum collection tool) and dashboards:

- White #ffffff work surface; ink #141414 (18.42).
- Sidebar 232 px on ground #f2efe8, items 32 px, 14 px lowercase labels; active item: 4 px accent bar on its left, weight 600.
- Top bar 48 px, 2 px ink bottom rule. Radius 4–6; inputs 36 px with a 2 px ink border; focus ring 2 px blue, offset 2.
- Tables 40 px rows, 14 px, tabular figures, hairline rows at #e8e3d8. States pair a shape and a word: filled square "confirmed", hollow circle "pending", triangle "conflict". Shapes in ink; only the urgent state in red.
- Charts: bars in ink with one bar in the accent; gridlines #e8e3d8; direct labels.
- Example moment: room booking grid for "werkstatt 2" with a red conflict cell "Tue 14:00, double booked: J. Albers / M. Brandt".

## 12. Signature moves

1. Lowercase display at masthead scale (112–200 px).
2. A heavy black bar (18 px) as rule or frame.
3. Photos set into the text (typophoto).
4. Red and black as the working pair; one primary as a large field.
5. Asymmetric splits and one large empty area.
6. Small radius on controls only; overlap instead of shadow.
7. Circle, square, triangle in Kandinsky's colours, on the grid, at most three.
8. Programme set as a real table.

## 13. Anti-patterns

1. Shapes scattered as confetti or drifting at random angles.
2. More than three shapes per screen, or shapes in every section.
3. Rounded corners or soft shadows.
4. The "Bauhaus 93" style rounded novelty face.
5. Primaries in equal areas everywhere (a quilt).
6. Gradients inside shapes or text.
7. Centred symmetric layouts.
8. Lowercase forced onto long body text.
9. Red text below 24 px on ground-2, or red text on ink at any size.
10. Yellow text on paper.
11. Three equal course cards with an icon each.
12. Outline-only shapes everywhere.
13. Shapes swapped against Kandinsky's pairing (a red circle, a blue triangle) when the reference should be legible.

## 14. Overrides of the global anti-slop

- **Geometric shapes: allowed** only as described here (flat, on the grid, at most three, each with a role). People and objects built from circles and rectangles stay banned.
- **Yellow on ink** is allowed as a field; the ground is neutral near-black, not navy.
- No other override.

## 15. Breakable rules (when the person asks for something bolder)

1. **Square fields and bars.**
   - Protects: the constructed, machine-cut look.
   - Breaking gives: a half disc as a section top reads as a doorway or an arch.
   - Allowed when: it is the only curve besides circles, and it echoes a real building.
2. **Three shapes per screen.**
   - Protects: legibility and restraint.
   - Breaking gives: 6–9 shapes on one screen read as an exhibition poster.
   - Allowed when: the screen has only a title and a date, once per page.
3. **Lowercase.**
   - Protects: the school's own voice.
   - Breaking gives: short capitals in a heavy stencil weight evoke Albers' and Schmidt's poster letters.
   - Allowed when: fewer than five words, tracking 0 or above.
4. **Horizontal reading.**
   - Protects: legibility.
   - Breaking gives: a display line on a steep diagonal (Moholy-Nagy's free use of all directions) adds motion.
   - Allowed when: it is the only diagonal, on a hero without body text.

## 16. Self-check

1. Is display lowercase at 112 px or larger, in one family from the table?
2. Is there one black bar per screen, of one width for the page?
3. Is only one primary the UI accent, and at most one primary a large field?
4. Do only controls and images take the small radius, with no shadows anywhere?
5. Is the layout asymmetric, with one generous empty area?
6. Does every red text pass 4.5:1 on its ground?
7. Are photos set into the text, not boxed as decoration?
8. If shapes appear, are they on the grid, at most three, in Kandinsky's colours?
9. Is there a real table rather than three cards?
10. Does it read as a print composition, not a template with circles added?
